import { getContact } from '../contacts'
import { updateContact } from '../contacts'
import { sendCapiEvent, isCapiConfigured } from '@/lib/facebook/capi'

// The GHL calendar (booking widget) ID used on /mortgage-holds.
// Matches BOOKING_IFRAME_SRC in app/(marketing)/mortgage-holds/page.tsx.
const MORTGAGE_HOLDS_CALENDAR_ID =
  process.env.GHL_MORTGAGE_HOLDS_CALENDAR_ID ?? 'n6ep2x22ahM8EnsfIsKk'

interface AppointmentPayload {
  // REST / Workflow shapes vary — accept either
  id?: string
  appointmentId?: string
  contactId?: string
  contact_id?: string
  calendarId?: string
  calendar_id?: string
  appointmentStatus?: string
  startTime?: string
  start_time?: string
  appointment?: Record<string, unknown>
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

// GHL Workflow webhooks for appointment triggers nest data under `appointment.*`.
// Native REST webhooks put it at the root. Custom Data fields land at the root.
// This reader checks both.
function readField(payload: AppointmentPayload, ...keys: string[]): string | undefined {
  return (
    pickString(payload as Record<string, unknown>, ...keys) ??
    pickString(payload.appointment, ...keys)
  )
}

export async function handleAppointmentWebhook(
  eventType: string,
  payload: AppointmentPayload
): Promise<void> {
  // We only fire ad conversion events on creation. Updates/cancellations don't
  // help ad optimization and would inflate conversion counts.
  if (eventType !== 'AppointmentCreate') return

  const contactId = readField(payload, 'contactId', 'contact_id')
  const calendarId = readField(payload, 'calendarId', 'calendar_id')
  const appointmentId = readField(payload, 'appointmentId', 'id')
  if (!contactId) return

  const contact = await getContact(contactId)
  if (!contact?.email) return // CAPI without identifying data is useless

  const isMortgageHoldsBooking = calendarId === MORTGAGE_HOLDS_CALENDAR_ID

  // Tag the contact so workflows / segments can target mortgage-holds leads.
  if (isMortgageHoldsBooking) {
    const existingTags = Array.isArray(contact.tags) ? contact.tags : []
    if (!existingTags.includes('mortgage-holds-lead')) {
      await updateContact(contactId, { tags: [...existingTags, 'mortgage-holds-lead'] }).catch(() => null)
    }
  }

  if (!isCapiConfigured()) return

  await sendCapiEvent({
    eventName: 'Schedule',
    eventId: appointmentId ? `ghl-appt-${appointmentId}` : undefined,
    eventSourceUrl: isMortgageHoldsBooking
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/mortgage-holds`
      : undefined,
    actionSource: 'system_generated',
    userData: {
      email: contact.email,
      phone: contact.phone,
      firstName: contact.firstName,
      lastName: contact.lastName,
      externalId: contact.id,
    },
    customData: {
      content_name: isMortgageHoldsBooking ? 'Mortgage Holds Booking' : 'GHL Booking',
      calendar_id: calendarId,
      appointment_status: readField(payload, 'appointmentStatus', 'status'),
    },
  }).catch((err) => {
    console.error('[ghl appointments] CAPI Schedule failed', err)
  })
}
