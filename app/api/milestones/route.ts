import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: milestones, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: links, error: linkErr } = await supabase
    .from('milestone_offers')
    .select('milestone_id, offer_id, sequence')
    .in('milestone_id', (milestones ?? []).map((m: { id: string }) => m.id))
  if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 })

  return NextResponse.json({ milestones: milestones ?? [], links: links ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const name: string = body.name?.trim() ?? ''
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const payload = {
    user_id: user.id,
    name,
    description: body.description ?? null,
    sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
  }

  const { data, error } = await supabase
    .from('milestones')
    .insert(payload as never)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ milestone: data }, { status: 201 })
}
