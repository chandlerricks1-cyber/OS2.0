import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requested = url.searchParams.get('user_id')
  const res = await resolveContext(requested)
  if (!res.ok) return res.response
  const { supabase, targetUserId } = res.ctx

  const { data, error } = await supabase
    .from('crucible_tasks')
    .select('*')
    .eq('user_id', targetUserId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tasks: data ?? [] })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(body.user_id)
  if (!res.ok) return res.response
  const { supabase, targetUserId } = res.ctx

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const payload = {
    user_id: targetUserId,
    title,
    accountable_team_member_id:
      typeof body.accountable_team_member_id === 'string' ? body.accountable_team_member_id : null,
    accountable_name: typeof body.accountable_name === 'string' ? body.accountable_name : null,
    call_recording_id: typeof body.call_recording_id === 'string' ? body.call_recording_id : null,
    status: 'new' as const,
  }

  const { data, error } = await supabase
    .from('crucible_tasks')
    .insert(payload as never)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data }, { status: 201 })
}
