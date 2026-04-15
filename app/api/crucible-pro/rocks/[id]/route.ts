import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'

const ROCK_STATUSES = new Set(['active', 'completed', 'abandoned'])

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  const { supabase, isAdmin, userId } = res.ctx

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.title === 'string') updates.title = body.title.trim()
  if ('description' in body) updates.description = body.description ?? null
  if ('target_date' in body) updates.target_date = body.target_date || null
  if (typeof body.status === 'string' && ROCK_STATUSES.has(body.status)) updates.status = body.status

  let query = supabase.from('crucible_rocks').update(updates).eq('id', id)
  if (!isAdmin) query = query.eq('user_id', userId)

  const { data, error } = await query.select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ rock: data })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  const { supabase, isAdmin, userId } = res.ctx

  let query = supabase.from('crucible_rocks').delete().eq('id', id)
  if (!isAdmin) query = query.eq('user_id', userId)
  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
