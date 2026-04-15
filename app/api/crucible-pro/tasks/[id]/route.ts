import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'

const TASK_STATUSES = new Set(['new', 'done', 'not_done'])

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  const { supabase, isAdmin, userId } = res.ctx

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.title === 'string') updates.title = body.title.trim()
  if ('accountable_team_member_id' in body)
    updates.accountable_team_member_id = body.accountable_team_member_id ?? null
  if ('accountable_name' in body) updates.accountable_name = body.accountable_name ?? null
  if ('call_recording_id' in body) updates.call_recording_id = body.call_recording_id ?? null
  if (typeof body.sort_order === 'number') updates.sort_order = body.sort_order
  if (typeof body.status === 'string' && TASK_STATUSES.has(body.status)) {
    updates.status = body.status
    updates.completed_at = body.status === 'done' ? new Date().toISOString() : null
  }

  let query = supabase.from('crucible_tasks').update(updates).eq('id', id)
  if (!isAdmin) query = query.eq('user_id', userId)

  const { data, error } = await query.select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ task: data })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  const { supabase, isAdmin, userId } = res.ctx

  let query = supabase.from('crucible_tasks').delete().eq('id', id)
  if (!isAdmin) query = query.eq('user_id', userId)
  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
