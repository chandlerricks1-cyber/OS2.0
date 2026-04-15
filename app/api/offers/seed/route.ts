import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type OfferType = 'attraction' | 'core' | 'upsell' | 'downsell' | 'continuity'

function pickType(raw: unknown): OfferType {
  const s = typeof raw === 'string' ? raw.toLowerCase() : ''
  if (s.includes('attract') || s.includes('lead')) return 'attraction'
  if (s.includes('upsell')) return 'upsell'
  if (s.includes('downsell')) return 'downsell'
  if (s.includes('continuity') || s.includes('recurring') || s.includes('subscription')) return 'continuity'
  return 'core'
}

// Seed offers table from business_metrics.offers / primary_offers JSONB.
// No-op if offers already exist for the user.
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { count: existing } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  if ((existing ?? 0) > 0) {
    return NextResponse.json({ seeded: 0, reason: 'offers already exist' })
  }

  const { data: metrics } = await supabase
    .from('business_metrics')
    .select('primary_offers')
    .eq('user_id', user.id)
    .single()

  const source =
    metrics && typeof metrics === 'object' && 'primary_offers' in metrics
      ? (metrics as { primary_offers: unknown }).primary_offers
      : null
  const list: unknown[] = Array.isArray(source) ? source : []
  if (list.length === 0) return NextResponse.json({ seeded: 0, reason: 'no intake offers found' })

  const rows = list.map((raw, i) => {
    const o = (raw ?? {}) as Record<string, unknown>
    const name = typeof o.name === 'string' ? o.name : typeof o.title === 'string' ? o.title : `Offer ${i + 1}`
    const offer_type = pickType(o.type ?? o.category ?? o.offer_type)
    const price = typeof o.price === 'string' ? o.price : typeof o.price === 'number' ? `$${o.price}` : null
    const what_customer_gets =
      typeof o.description === 'string' ? o.description : typeof o.what === 'string' ? o.what : null
    return {
      user_id: user.id,
      name,
      offer_type,
      price,
      what_customer_gets,
      sort_order: i,
    }
  })

  const { data, error } = await supabase.from('offers').insert(rows as never).select('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ seeded: data?.length ?? 0 })
}
