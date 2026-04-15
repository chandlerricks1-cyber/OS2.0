import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { parseTranscript } from '@/lib/crucible-pro/transcript'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  const { supabase, isAdmin, userId } = res.ctx

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.title === 'string') updates.title = body.title.trim()
  if (typeof body.call_date === 'string') updates.call_date = body.call_date
  if ('zoom_recording_url' in body) updates.zoom_recording_url = body.zoom_recording_url ?? null
  if ('appointment_id' in body) updates.appointment_id = body.appointment_id ?? null
  if ('transcript_raw' in body) {
    updates.transcript_raw = body.transcript_raw ?? null
    updates.transcript_segments = body.transcript_raw ? parseTranscript(body.transcript_raw) : null
  }

  let query = supabase.from('crucible_call_recordings').update(updates).eq('id', id)
  if (!isAdmin) query = query.eq('user_id', userId)
  const { data, error } = await query.select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ recording: data })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  const { supabase, isAdmin, userId } = res.ctx

  let query = supabase.from('crucible_call_recordings').delete().eq('id', id)
  if (!isAdmin) query = query.eq('user_id', userId)
  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
