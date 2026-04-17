import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const OFFER_TYPES = ['attraction', 'core', 'upsell', 'downsell', 'continuity'] as const
type OfferType = (typeof OFFER_TYPES)[number]

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

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('offer_type')
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ offers: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const name: string = body.name?.trim() ?? ''
  const offer_type: OfferType = body.offer_type

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!OFFER_TYPES.includes(offer_type)) {
    return NextResponse.json({ error: 'Invalid offer_type' }, { status: 400 })
  }

  const payload: Record<string, unknown> = { user_id: user.id, name, offer_type }
  for (const field of EDITABLE_FIELDS) {
    if (field === 'name' || field === 'offer_type') continue
    if (body[field] !== undefined) payload[field] = body[field]
  }

  const { data, error } = await supabase
    .from('offers')
    .insert(payload as never)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ offer: data }, { status: 201 })
}
