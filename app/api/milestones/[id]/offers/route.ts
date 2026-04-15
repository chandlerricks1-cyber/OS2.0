import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Attach an offer to a milestone
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: milestoneId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const offerId: string = body.offer_id
  if (!offerId) return NextResponse.json({ error: 'offer_id is required' }, { status: 400 })

  const sequence = typeof body.sequence === 'number' ? body.sequence : 0

  const { data, error } = await supabase
    .from('milestone_offers')
    .insert({ milestone_id: milestoneId, offer_id: offerId, sequence } as never)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ link: data }, { status: 201 })
}
