import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { updateCalendarEvent } from '@/lib/ghl/client'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  const { supabase, isAdmin, userId } = res.ctx

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.title === 'string') updates.title = body.title
  if (typeof body.starts_at === 'string') updates.starts_at = body.starts_at
  if (typeof body.ends_at === 'string' || body.ends_at === null) updates.ends_at = body.ends_at
  if (typeof body.meeting_link === 'string' || body.meeting_link === null)
    updates.meeting_link = body.meeting_link
  if (typeof body.notes === 'string' || body.notes === null) updates.notes = body.notes
  if (Array.isArray(body.guests)) updates.guests = body.guests

  let query = supabase.from('crucible_appointments').update(updates).eq('id', id)
  if (!isAdmin) query = query.eq('user_id', userId)
  const { data, error } = await query.select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Mirror to GHL if this is a synced event
  const appt = data as { ghl_event_id: string | null; title: string; starts_at: string; ends_at: string | null; notes: string | null }
  if (appt.ghl_event_id && (updates.title || updates.starts_at || updates.ends_at || updates.notes)) {
    try {
      await updateCalendarEvent(appt.ghl_event_id, {
        title: appt.title,
        startTime: appt.starts_at,
        endTime: appt.ends_at ?? undefined,
        notes: appt.notes ?? undefined,
      })
    } catch (e) {
      return NextResponse.json({
        appointment: data,
        warning: `Saved locally but GHL update failed: ${e instanceof Error ? e.message : 'unknown error'}`,
      })
    }
  }

  return NextResponse.json({ appointment: data })
}
