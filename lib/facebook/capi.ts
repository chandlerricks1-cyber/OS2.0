// Facebook Conversions API (CAPI) server-side helper.
// Docs: https://developers.facebook.com/docs/marketing-api/conversions-api

import { createHash } from 'crypto'

const GRAPH_API_VERSION = 'v19.0'

export function isCapiConfigured(): boolean {
  return !!(process.env.FB_PIXEL_ID && process.env.FB_CAPI_ACCESS_TOKEN)
}

export interface CapiUserData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  externalId?: string
  fbp?: string // _fbp cookie
  fbc?: string // _fbc cookie
  clientIpAddress?: string
  clientUserAgent?: string
}

export interface CapiEventInput {
  eventName: string
  eventId?: string
  eventTime?: number // unix seconds
  eventSourceUrl?: string
  actionSource?: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other'
  userData?: CapiUserData
  customData?: Record<string, unknown>
}

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

function buildUserData(u: CapiUserData = {}): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  if (u.email) data.em = [sha256(u.email)]
  if (u.phone) data.ph = [sha256(normalizePhone(u.phone))]
  if (u.firstName) data.fn = [sha256(u.firstName)]
  if (u.lastName) data.ln = [sha256(u.lastName)]
  if (u.externalId) data.external_id = [sha256(u.externalId)]
  if (u.fbp) data.fbp = u.fbp
  if (u.fbc) data.fbc = u.fbc
  if (u.clientIpAddress) data.client_ip_address = u.clientIpAddress
  if (u.clientUserAgent) data.client_user_agent = u.clientUserAgent
  return data
}

export async function sendCapiEvent(input: CapiEventInput): Promise<{ ok: boolean; status: number; body: unknown }> {
  const pixelId = process.env.FB_PIXEL_ID
  const accessToken = process.env.FB_CAPI_ACCESS_TOKEN
  if (!pixelId || !accessToken) {
    return { ok: false, status: 0, body: { error: 'CAPI not configured' } }
  }

  const event = {
    event_name: input.eventName,
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    event_source_url: input.eventSourceUrl,
    action_source: input.actionSource ?? 'website',
    user_data: buildUserData(input.userData),
    custom_data: input.customData ?? {},
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`
  const body: Record<string, unknown> = { data: [event] }
  if (process.env.FB_TEST_EVENT_CODE) body.test_event_code = process.env.FB_TEST_EVENT_CODE

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  let parsed: unknown = null
  const text = await res.text()
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    parsed = { raw: text }
  }
  return { ok: res.ok, status: res.status, body: parsed }
}
