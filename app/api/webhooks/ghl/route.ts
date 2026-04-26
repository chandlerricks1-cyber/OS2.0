import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyGhlSignature } from '@/lib/ghl/webhook-verify'
import { handleContactWebhook } from '@/lib/ghl/webhooks/contacts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface WebhookPayload {
  type?: string
  webhookId?: string
  id?: string
  locationId?: string
  [k: string]: unknown
}

function deriveEventId(payload: WebhookPayload): string {
  // Prefer GHL-provided webhookId; fall back to type+id+timestamp.
  if (typeof payload.webhookId === 'string' && payload.webhookId) return payload.webhookId
  const ts = (payload.dateUpdated as string | undefined) ?? new Date().toISOString()
  return `${payload.type ?? 'unknown'}:${payload.id ?? 'noid'}:${ts}`
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature =
    req.headers.get('x-wh-signature') ??
    req.headers.get('x-ghl-signature') ??
    req.headers.get('x-signature')

  // In dev / first-time setup, allow unsigned events if GHL_WEBHOOK_SECRET unset.
  if (process.env.GHL_WEBHOOK_SECRET) {
    const verify = verifyGhlSignature(rawBody, signature)
    if (!verify.ok) {
      return NextResponse.json({ error: verify.reason ?? 'invalid signature' }, { status: 401 })
    }
  }

  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const eventId = deriveEventId(payload)
  const eventType = (payload.type as string) ?? 'unknown'

  // Idempotency: insert into log; on conflict do nothing means we've seen it.
  const { error: insertErr, data: inserted } = await supabaseAdmin
    .from('ghl_webhook_events')
    .insert({ event_id: eventId, event_type: eventType, payload: payload as unknown as never })
    .select('id')
    .single()

  if (insertErr) {
    // Duplicate key = already processed; return 200 immediately.
    if (insertErr.code === '23505') {
      return NextResponse.json({ duplicate: true }, { status: 200 })
    }
    console.error('[ghl webhook] event log insert failed', insertErr)
    return NextResponse.json({ error: 'log insert failed' }, { status: 200 })
  }

  try {
    await routeEvent(eventType, payload)
    await supabaseAdmin
      .from('ghl_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', inserted!.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'handler failed'
    console.error('[ghl webhook] handler error', eventType, msg)
    await supabaseAdmin
      .from('ghl_webhook_events')
      .update({ error: msg })
      .eq('id', inserted!.id)
    // Return 200 so GHL doesn't retry forever; we use the events table for re-drive.
    return NextResponse.json({ error: msg }, { status: 200 })
  }
}

async function routeEvent(eventType: string, payload: WebhookPayload) {
  if (eventType.startsWith('Contact')) {
    await handleContactWebhook(eventType, payload as never)
    return
  }
  // Conversation/Calendar/Opportunity handlers added in later phases.
  // For now, log + ack so we don't lose the event.
  console.log('[ghl webhook] queued (no handler yet):', eventType, payload.id)
}
