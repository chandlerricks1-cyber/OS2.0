import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { parseTranscript } from '@/lib/crucible-pro/transcript'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requested = url.searchParams.get('user_id')
  const res = await resolveContext(requested)
  if (!res.ok) return res.response
  const { supabase, targetUserId } = res.ctx

  const { data, error } = await supabase
    .from('crucible_call_recordings')
    .select('*')
    .eq('user_id', targetUserId)
    .order('call_date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ recordings: data ?? [] })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(body.user_id)
  if (!res.ok) return res.response
  const { supabase, targetUserId } = res.ctx

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  const callDate = typeof body.call_date === 'string' && body.call_date ? body.call_date : null
  if (!callDate) return NextResponse.json({ error: 'Call date is required' }, { status: 400 })

  const transcriptRaw = typeof body.transcript_raw === 'string' ? body.transcript_raw : null
  const segments = transcriptRaw ? parseTranscript(transcriptRaw) : null

  const payload = {
    user_id: targetUserId,
    appointment_id: typeof body.appointment_id === 'string' ? body.appointment_id : null,
    title,
    call_date: callDate,
    zoom_recording_url: typeof body.zoom_recording_url === 'string' ? body.zoom_recording_url : null,
    transcript_raw: transcriptRaw,
    transcript_segments: segments,
  }

  const { data, error } = await supabase
    .from('crucible_call_recordings')
    .insert(payload as never)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ recording: data }, { status: 201 })
}
