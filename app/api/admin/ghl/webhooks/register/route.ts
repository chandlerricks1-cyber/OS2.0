import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { GHL_WEBHOOK_EVENTS } from '@/lib/ghl/webhooks-registry'

export const runtime = 'nodejs'

function webhookUrl(req: NextRequest) {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  const host = req.headers.get('host') ?? ''
  const proto = req.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  const base = explicit || `${proto}://${host}`
  return `${base.replace(/\/$/, '')}/api/webhooks/ghl`
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { data: state } = await supabaseAdmin
    .from('ghl_sync_state')
    .select('value, updated_at')
    .eq('key', 'webhooks')
    .maybeSingle()

  return NextResponse.json({
    url: webhookUrl(req),
    secretConfigured: !!process.env.GHL_WEBHOOK_SECRET,
    events: GHL_WEBHOOK_EVENTS,
    configured: !!state?.value,
    configuredAt: state?.updated_at ?? null,
    state: state?.value ?? null,
  })
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const url = webhookUrl(req)
  const value = {
    url,
    events: GHL_WEBHOOK_EVENTS,
    confirmedBy: guard.user.id,
    confirmedAt: new Date().toISOString(),
    secretConfigured: !!process.env.GHL_WEBHOOK_SECRET,
  }

  const { error } = await supabaseAdmin
    .from('ghl_sync_state')
    .upsert({
      key: 'webhooks',
      value: value as unknown as never,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, url, events: GHL_WEBHOOK_EVENTS })
}

export async function DELETE() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { error } = await supabaseAdmin
    .from('ghl_sync_state')
    .delete()
    .eq('key', 'webhooks')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
