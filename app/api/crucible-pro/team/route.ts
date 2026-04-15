import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requested = url.searchParams.get('user_id')
  const res = await resolveContext(requested)
  if (!res.ok) return res.response
  const { supabase, targetUserId } = res.ctx

  const { data, error } = await supabase
    .from('crucible_team_members')
    .select('*')
    .eq('user_id', targetUserId)
    .order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ team: data ?? [] })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(body.user_id)
  if (!res.ok) return res.response
  const { supabase, targetUserId } = res.ctx

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const accountabilities = Array.isArray(body.accountabilities)
    ? body.accountabilities.filter((a: unknown): a is string => typeof a === 'string' && a.trim().length > 0)
    : []

  const payload = {
    user_id: targetUserId,
    name,
    position: typeof body.position === 'string' ? body.position : null,
    phone: typeof body.phone === 'string' ? body.phone : null,
    email: typeof body.email === 'string' ? body.email : null,
    accountabilities,
  }

  const { data, error } = await supabase
    .from('crucible_team_members')
    .insert(payload as never)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ member: data }, { status: 201 })
}
