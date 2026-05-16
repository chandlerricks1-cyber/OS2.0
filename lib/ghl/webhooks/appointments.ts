import { getContact } from '../contacts'
import { updateContact } from '../contacts'
import { sendCapiEvent, isCapiConfigured } from '@/lib/facebook/capi'

// The GHL calendar (booking widget) ID used on /mortgage-holds.
// Matches BOOKING_IFRAME_SRC in app/(marketing)/mortgage-holds/page.tsx.
const MORTGAGE_HOLDS_CALENDAR_ID =
  process.env.GHL_MORTGAGE_HOLDS_CALENDAR_ID ?? 'n6ep2x22ahM8EnsfIsKk'

interface AttributionSource {
  fbp?: string
  fbc?: string
  ip?: string
  userAgent?: string
  url?: string
}

interface AppointmentPayload {
  // Shape varies — Workflow webhook nests data under `calendar.*`, custom data
  // lands at the root, native REST puts it at the root in camelCase.
  id?: string
  appointmentId?: string
  contactId?: string
  contact_id?: string
  calendarId?: string
  calendar_id?: string
  appointment_id?: string
  appointmentStatus?: string
  appointment_status?: string
  calendar?: Record<string, unknown>
  appointment?: Record<string, unknown>
  contact?: {
    attributionSource?: AttributionSource
    lastAttributionSource?: AttributionSource
    [k: string]: unknown
  }
  attributionSource?: AttributionSource
  [k: string]: unknown
}

function pickString(obj: Record<string, unknown> | undefined, ...keys: string[]): string | undefined {
  if (!obj) return undefined
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v) return v
  }
  return undefined
}

// Read a field from anywhere it might live in the GHL payload:
// 1. Root (custom data fields, REST shape)
// 2. payload.calendar.* (Workflow webhook appointment trigger — canonical)
// 3. payload.appointment.* (defensive — some shapes use this)
function readField(payload: AppointmentPayload, ...keys: string[]): string | undefined {
  return (
    pickString(payload as Record<string, unknown>, ...keys) ??
    pickString(payload.calendar, ...keys) ??
    pickString(payload.appointment, ...keys)
  )
}

function pickAttribution(payload: AppointmentPayload): AttributionSource {
  return (
    payload.attributionSource ??
    payload.contact?.attributionSource ??
    payload.contact?.lastAttributionSource ??
    {}
  )
}

export async function handleAppointmentWebhook(
  eventType: string,
  payload: AppointmentPayload
): Promise<void> {
  if (eventType !== 'AppointmentCreate') return

  const contactId = readField(payload, 'contactId', 'contact_id')
  // calendar.id is the canonical GHL location; customData mappings vary, so we
  // accept calendarId/calendar_id too — but prefer the calendar object's id.
  const calendarId =
    pickString(payload.calendar, 'id') ??
    readField(payload, 'calendarId', 'calendar_id')
  const appointmentId =
    pickString(payload.calendar, 'appointmentId') ??
    readField(payload, 'appointmentId', 'appointment_id', 'id')

  if (!contactId) {
    console.warn('[ghl appointments] no contact_id in payload — skipping')
    return
  }

  const contact = await getContact(contactId)
  if (!contact?.email) {
    console.warn('[ghl appointments] contact has no email — skipping CAPI', { contactId })
    return
  }

  const isMortgageHoldsBooking = calendarId === MORTGAGE_HOLDS_CALENDAR_ID

  if (isMortgageHoldsBooking) {
    const existingTags = Array.isArray(contact.tags) ? contact.tags : []
    if (!existingTags.includes('mortgage-holds-lead')) {
      await updateContact(contactId, { tags: [...existingTags, 'mortgage-holds-lead'] }).catch(
        (err) => console.error('[ghl appointments] tag update failed', err)
      )
    }
  }

  if (!isCapiConfigured()) {
    console.warn('[ghl appointments] CAPI not configured — skipping Schedule event')
    return
  }

  const attribution = pickAttribution(payload)
  const appointmentStatus = readField(payload, 'appointmentStatus', 'appointment_status') ??
    pickString(payload.calendar, 'appoinmentStatus', 'appointmentStatus', 'status')

  const result = await sendCapiEvent({
    eventName: 'Schedule',
    eventId: appointmentId ? `ghl-appt-${appointmentId}` : undefined,
    eventSourceUrl:
      attribution.url ??
      (isMortgageHoldsBooking
        ? `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/mortgage-holds`
        : undefined),
    actionSource: 'system_generated',
    userData: {
      email: contact.email,
      phone: contact.phone,
      firstName: contact.firstName,
      lastName: contact.lastName,
      externalId: contact.id,
      fbp: attribution.fbp,
      fbc: attribution.fbc,
      clientIpAddress: attribution.ip,
      clientUserAgent: attribution.userAgent,
    },
    customData: {
      content_name: isMortgageHoldsBooking ? 'Mortgage Holds Booking' : 'GHL Booking',
      calendar_id: calendarId,
      appointment_status: appointmentStatus,
    },
  }).catch((err) => {
    console.error('[ghl appointments] CAPI Schedule threw', err)
    return { ok: false, status: 0, body: { error: String(err) } }
  })

  if (!result.ok) {
    console.error('[ghl appointments] CAPI Schedule rejected', {
      status: result.status,
      body: result.body,
      eventId: appointmentId,
      isMortgageHoldsBooking,
    })
  } else {
    console.log('[ghl appointments] CAPI Schedule sent', {
      eventId: appointmentId,
      isMortgageHoldsBooking,
      hasFbp: !!attribution.fbp,
    })
  }
}
