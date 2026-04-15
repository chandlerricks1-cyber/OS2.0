import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { isGhlConfigured, listCalendarEvents } from '@/lib/ghl/client'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(body.user_id)
  if (!res.ok) return res.response
  const { supabase, targetUserId } = res.ctx

  if (!isGhlConfigured()) {
    return NextResponse.json({ error: 'GHL is not configured on the server.' }, { status: 400 })
  }

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('ghl_contact_id')
    .eq('id', targetUserId)
    .maybeSingle()
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  const contactId = (profile as { ghl_contact_id?: string | null } | null)?.ghl_contact_id
  if (!contactId) {
    return NextResponse.json(
      { error: 'No GHL contact linked to this client. Set profiles.ghl_contact_id first.' },
      { status: 400 }
    )
  }

  const now = new Date()
  const horizon = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000)
  const events = await listCalendarEvents({
    contactId,
    startTime: now.toISOString(),
    endTime: horizon.toISOString(),
  })

  const nowIso = new Date().toISOString()
  const rows = events
    .filter((e) => !!e.startTime)
    .map((e) => ({
      user_id: targetUserId,
      ghl_event_id: e.id,
      title: e.title ?? 'Appointment',
      starts_at: e.startTime!,
      ends_at: e.endTime ?? null,
      guests: (e.users ?? []).map((u) => u.email).filter((x): x is string => !!x),
      meeting_link: null,
      notes: e.notes ?? null,
      last_synced_at: nowIso,
    }))

  if (rows.length === 0) {
    return NextResponse.json({ synced: 0, events: [] })
  }

  const { error: upErr } = await supabase
    .from('crucible_appointments')
    .upsert(rows as never, { onConflict: 'user_id,ghl_event_id' })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  return NextResponse.json({ synced: rows.length, events: rows })
}
