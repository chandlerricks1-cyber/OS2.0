import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const OFFER_TYPES = ['attraction', 'core', 'upsell', 'downsell', 'continuity'] as const

const EDITABLE_FIELDS = [
  'name',
  'offer_type',
  'price',
  'what_customer_gets',
  'why_do_it',
  'when_offered',
  'trigger',
  'sales_pitch',
  'thumbnail_url',
  'short_description',
  'video_url',
  'classroom_body',
  'sort_order',
  'is_active',
  'source',
] as const

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const patch: Record<string, unknown> = {}
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) patch[field] = body[field]
  }
  if (patch.offer_type && !OFFER_TYPES.includes(patch.offer_type as never)) {
    return NextResponse.json({ error: 'Invalid offer_type' }, { status: 400 })
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }
  patch.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('offers')
    .update(patch as never)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ offer: data })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('offers')
    .update({ is_active: false, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
