import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  const { supabase, isAdmin, userId } = res.ctx

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.name === 'string') updates.name = body.name.trim()
  if ('position' in body) updates.position = body.position ?? null
  if ('phone' in body) updates.phone = body.phone ?? null
  if ('email' in body) updates.email = body.email ?? null
  if (Array.isArray(body.accountabilities)) {
    updates.accountabilities = body.accountabilities.filter(
      (a: unknown): a is string => typeof a === 'string' && a.trim().length > 0
    )
  }
  if (typeof body.sort_order === 'number') updates.sort_order = body.sort_order

  let query = supabase.from('crucible_team_members').update(updates).eq('id', id)
  if (!isAdmin) query = query.eq('user_id', userId)

  const { data, error } = await query.select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ member: data })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  const { supabase, isAdmin, userId } = res.ctx

  let query = supabase.from('crucible_team_members').delete().eq('id', id)
  if (!isAdmin) query = query.eq('user_id', userId)
  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
