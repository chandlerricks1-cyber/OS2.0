import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MoneyModelTabs } from '@/components/money-model/MoneyModelTabs'
import { ShareLinkButton } from '@/components/money-model/ShareLinkButton'
import type { Offer, Milestone, MilestoneOffer } from '@/types/offer'

export default async function MoneyModelPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('sort_order')

  // Seed from intake on first visit if no offers exist yet.
  if (!offers || offers.length === 0) {
    const { data: metrics } = await supabase
      .from('business_metrics')
      .select('primary_offers')
      .eq('user_id', user.id)
      .maybeSingle()
    const source =
      metrics && typeof metrics === 'object' && 'primary_offers' in metrics
        ? (metrics as { primary_offers: unknown }).primary_offers
        : null
    const list = Array.isArray(source) ? (source as unknown[]) : []
    if (list.length > 0) {
      const rows = list.map((raw, i) => {
        const o = (raw ?? {}) as Record<string, unknown>
        const typeRaw = typeof o.type === 'string' ? o.type.toLowerCase() : ''
        const offer_type = typeRaw.includes('attract') || typeRaw.includes('lead')
          ? 'attraction'
          : typeRaw.includes('upsell')
          ? 'upsell'
          : typeRaw.includes('downsell')
          ? 'downsell'
          : typeRaw.includes('continuity') || typeRaw.includes('recurring') || typeRaw.includes('subscription')
          ? 'continuity'
          : 'core'
        return {
          user_id: user.id,
          name: (typeof o.name === 'string' && o.name) || (typeof o.title === 'string' && o.title) || `Offer ${i + 1}`,
          offer_type,
          price:
            typeof o.price === 'string'
              ? o.price
              : typeof o.price === 'number'
              ? `$${o.price}`
              : null,
          what_customer_gets:
            typeof o.description === 'string' ? o.description : typeof o.what === 'string' ? o.what : null,
          sort_order: i,
        }
      })
      await supabase.from('offers').insert(rows as never)
      const { data: reseeded } = await supabase
        .from('offers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order')
      offers = reseeded ?? []
    }
  }

  const [{ data: milestones }, { data: links }, { data: profile }] = await Promise.all([
    supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order'),
    supabase
      .from('milestone_offers')
      .select('milestone_id, offer_id, sequence'),
    supabase
      .from('profiles')
      .select('public_share_slug, public_share_enabled')
      .eq('id', user.id)
      .single(),
  ])

  const reqHeaders = await headers()
  const host = reqHeaders.get('host') ?? 'localhost:3000'
  const proto = reqHeaders.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Money Model</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize your offers, map the customer journey, and build your classroom library.
          </p>
        </div>
        <ShareLinkButton
          initial={{
            slug: profile?.public_share_slug ?? null,
            enabled: profile?.public_share_enabled ?? false,
          }}
          baseUrl={baseUrl}
        />
      </div>

      <MoneyModelTabs
        initialTab={tab === 'journey' || tab === 'classroom' ? tab : 'overview'}
        offers={(offers as Offer[]) ?? []}
        milestones={(milestones as Milestone[]) ?? []}
        links={(links as MilestoneOffer[]) ?? []}
      />
    </div>
  )
}
