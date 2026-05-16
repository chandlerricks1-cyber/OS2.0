// Browser-side Facebook Pixel helper.
// Use fbTrack('Lead', { value: 100, currency: 'USD' }) from any client component.

type StandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'Schedule'
  | 'SubmitApplication'
  | 'StartTrial'
  | 'Subscribe'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export interface FbEventOptions {
  // Standard event params: value, currency, content_name, content_ids, etc.
  // See https://developers.facebook.com/docs/meta-pixel/reference
  [key: string]: unknown
}

export interface FbUserData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  externalId?: string
}

/**
 * Fire a standard Pixel event in the browser AND mirror it to the server
 * (Conversions API + GHL contact upsert) via /api/track.
 *
 * The eventId is shared between browser and server so Meta can dedupe.
 */
export async function fbTrack(
  event: StandardEvent | (string & {}),
  options: FbEventOptions = {},
  userData: FbUserData = {}
): Promise<void> {
  const eventId = options.eventId as string | undefined ?? crypto.randomUUID()

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    const isStandard = STANDARD_EVENTS.has(event)
    window.fbq(isStandard ? 'track' : 'trackCustom', event, options, { eventID: eventId })
  }

  // Mirror to server (CAPI + GHL). Fire-and-forget — don't block the UI.
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event,
        eventId,
        eventSourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        options,
        userData,
      }),
    })
  } catch {
    // swallow — pixel still fired on client
  }
}

const STANDARD_EVENTS = new Set<string>([
  'PageView',
  'ViewContent',
  'Search',
  'AddToCart',
  'AddToWishlist',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
  'Lead',
  'CompleteRegistration',
  'Contact',
  'Schedule',
  'SubmitApplication',
  'StartTrial',
  'Subscribe',
])
