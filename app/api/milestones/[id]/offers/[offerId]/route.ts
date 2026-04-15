import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Update sequence or move to a different milestone
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; offerId: string }> }
) {
  const { id: milestoneId, offerId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const patch: Record<string, unknown> = {}
  if (typeof body.sequence === 'number') patch.sequence = body.sequence
  if (typeof body.milestone_id === 'string') patch.milestone_id = body.milestone_id
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('milestone_offers')
    .update(patch as never)
    .eq('milestone_id', milestoneId)
    .eq('offer_id', offerId)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ link: data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; offerId: string }> }
) {
  const { id: milestoneId, offerId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('milestone_offers')
    .delete()
    .eq('milestone_id', milestoneId)
    .eq('offer_id', offerId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
