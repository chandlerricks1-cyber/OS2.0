import { NextRequest, NextResponse } from 'next/server'
import { sendCapiEvent, isCapiConfigured } from '@/lib/facebook/capi'
import { isGhlConfigured, upsertContact, addContactNote } from '@/lib/ghl/client'

interface TrackBody {
  event: string
  eventId?: string
  eventSourceUrl?: string
  options?: Record<string, unknown>
  userData?: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    externalId?: string
  }
}

// Standard FB events that we should also mirror to GHL as a contact.
// PageView/ViewContent fire too often and don't carry user data — skip them for GHL.
const GHL_MIRROR_EVENTS = new Set([
  'Lead',
  'CompleteRegistration',
  'Contact',
  'Schedule',
  'SubmitApplication',
  'StartTrial',
  'Subscribe',
  'Purchase',
  'InitiateCheckout',
])

export async function POST(req: NextRequest) {
  let body: TrackBody
  try {
    body = (await req.json()) as TrackBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body?.event) {
    return NextResponse.json({ error: 'event is required' }, { status: 400 })
  }

  const fbp = req.cookies.get('_fbp')?.value
  const fbc = req.cookies.get('_fbc')?.value
  const userAgent = req.headers.get('user-agent') ?? undefined
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    undefined

  const capiResult = isCapiConfigured()
    ? await sendCapiEvent({
        eventName: body.event,
        eventId: body.eventId,
        eventSourceUrl: body.eventSourceUrl,
        userData: {
          ...body.userData,
          fbp,
          fbc,
          clientIpAddress: ip,
          clientUserAgent: userAgent,
        },
        customData: body.options ?? {},
      }).catch((err) => ({ ok: false, status: 0, body: { error: String(err) } }))
    : { skipped: true as const }

  let ghlResult: unknown = { skipped: true }
  if (GHL_MIRROR_EVENTS.has(body.event) && isGhlConfigured() && body.userData?.email) {
    try {
      const contact = await upsertContact({
        email: body.userData.email,
        phone: body.userData.phone,
        firstName: body.userData.firstName,
        lastName: body.userData.lastName,
        source: 'Facebook Pixel',
        tags: [`fb-pixel-${body.event.toLowerCase()}`],
      })
      const contactId = contact.contact?.id
      if (contactId) {
        const summary = [
          `Facebook Pixel event: ${body.event}`,
          body.eventSourceUrl ? `URL: ${body.eventSourceUrl}` : null,
          body.options && Object.keys(body.options).length
            ? `Data: ${JSON.stringify(body.options)}`
            : null,
        ]
          .filter(Boolean)
          .join('\n')
        await addContactNote({ contactId, body: summary }).catch(() => null)
      }
      ghlResult = { ok: true, contactId, isNew: contact.new }
    } catch (err) {
      ghlResult = { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  return NextResponse.json({ ok: true, capi: capiResult, ghl: ghlResult })
}
