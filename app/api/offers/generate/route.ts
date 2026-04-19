import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSingleOffer } from '@/lib/claude/offers'
import { aiRatelimit, checkRateLimit } from '@/lib/ratelimit'

const VALID_TYPES = ['attraction', 'upsell', 'downsell', 'continuity'] as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit AI generation
  const rateLimitResponse = await checkRateLimit(user.id, aiRatelimit)
  if (rateLimitResponse) return rateLimitResponse

  const body = await request.json().catch(() => ({}))
  const offerType: string = body.offer_type ?? ''

  if (!VALID_TYPES.includes(offerType as typeof VALID_TYPES[number])) {
    return NextResponse.json({ error: 'Invalid offer_type' }, { status: 400 })
  }

  // Fetch business metrics
  const { data: metrics } = await supabase
    .from('business_metrics')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!metrics) {
    return NextResponse.json(
      { error: 'Complete the intake first to generate offer ideas.' },
      { status: 400 }
    )
  }

  // Fetch existing offer names to avoid duplicates
  const { data: existingOffers } = await supabase
    .from('offers')
    .select('name')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const existingNames = (existingOffers ?? []).map((o) => (o as { name: string }).name)

  // Fetch intake messages for context
  const { data: session } = await supabase
    .from('intake_sessions')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  let intakeMessages: Array<{ role: string; content: string }> = []
  if (session) {
    const { data: msgs } = await supabase
      .from('intake_messages')
      .select('role, content')
      .eq('session_id', (session as { id: string }).id)
      .order('created_at', { ascending: false })
      .limit(20)

    intakeMessages = (msgs ?? []).reverse().map((m) => ({
      role: (m as { role: string }).role,
      content: (m as { content: string }).content,
    }))
  }

  try {
    const generated = await generateSingleOffer(
      offerType,
      metrics as unknown as Record<string, unknown>,
      existingNames,
      intakeMessages
    )

    // Count existing offers of this type for sort_order
    const { count } = await supabase
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('offer_type', offerType)
      .eq('is_active', true)

    // Insert the generated offer
    const { data: offer, error } = await supabase
      .from('offers')
      .insert({
        user_id: user.id,
        name: generated.name,
        offer_type: generated.offer_type,
        price: generated.price || null,
        what_customer_gets: generated.what_customer_gets || null,
        why_do_it: generated.why_do_it || null,
        when_offered: generated.when_offered || null,
        trigger: generated.trigger || null,
        sales_pitch: generated.sales_pitch || null,
        sort_order: count ?? 0,
        source: 'crucible_ai',
      } as never)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ offer }, { status: 201 })
  } catch (err) {
    console.error('[Generate Offer] failed:', err)
    return NextResponse.json(
      { error: 'Failed to generate offer idea. Please try again.' },
      { status: 500 }
    )
  }
}
