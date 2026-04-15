import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requested = url.searchParams.get('user_id')
  const res = await resolveContext(requested)
  if (!res.ok) return res.response
  const { supabase, targetUserId } = res.ctx

  const { data, error } = await supabase
    .from('crucible_rocks')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rocks: data ?? [] })
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
    description: typeof body.description === 'string' ? body.description : null,
    target_date: typeof body.target_date === 'string' && body.target_date ? body.target_date : null,
  }

  const { data, error } = await supabase
    .from('crucible_rocks')
    .insert(payload as never)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rock: data }, { status: 201 })
}
