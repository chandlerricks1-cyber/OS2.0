import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Offer, Milestone, MilestoneOffer } from '@/types/offer'

const OFFER_COLUMNS =
  'id, user_id, name, offer_type, price, what_customer_gets, why_do_it, when_offered, trigger, sales_pitch, thumbnail_url, short_description, video_url, classroom_body, sort_order, is_active, source, created_at, updated_at'

const MILESTONE_COLUMNS =
  'id, user_id, name, description, sort_order, created_at, updated_at'

const MILESTONE_OFFER_COLUMNS = 'milestone_id, offer_id, sequence'

export type PublicMoneyModelData = {
  ownerLabel: string
  offers: Offer[]
  milestones: Milestone[]
  links: MilestoneOffer[]
}

async function resolveSlug(slug: string): Promise<{ user_id: string; full_name: string | null } | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name')
    .eq('public_share_slug', slug)
    .eq('public_share_enabled', true)
    .maybeSingle()
  if (!data) return null
  return { user_id: data.id, full_name: data.full_name }
}

async function resolveOwnerLabel(userId: string, fullName: string | null): Promise<string> {
  const { data } = await supabaseAdmin
    .from('business_metrics')
    .select('company_name')
    .eq('user_id', userId)
    .maybeSingle()
  const company = data?.company_name?.trim()
  if (company) return company
  if (fullName?.trim()) return `${fullName.trim()}'s`
  return 'Money Model'
}

export async function getPublicMoneyModelBySlug(slug: string): Promise<PublicMoneyModelData | null> {
  const owner = await resolveSlug(slug)
  if (!owner) return null

  const [ownerLabel, offersRes, milestonesRes] = await Promise.all([
    resolveOwnerLabel(owner.user_id, owner.full_name),
    supabaseAdmin
      .from('offers')
      .select(OFFER_COLUMNS)
      .eq('user_id', owner.user_id)
      .eq('is_active', true)
      .order('sort_order'),
    supabaseAdmin
      .from('milestones')
      .select(MILESTONE_COLUMNS)
      .eq('user_id', owner.user_id)
      .order('sort_order'),
  ])

  const milestoneIds = (milestonesRes.data ?? []).map((m) => m.id)
  const linksRes = milestoneIds.length
    ? await supabaseAdmin
        .from('milestone_offers')
        .select(MILESTONE_OFFER_COLUMNS)
        .in('milestone_id', milestoneIds)
    : { data: [] as MilestoneOffer[] }

  return {
    ownerLabel,
    offers: (offersRes.data ?? []) as Offer[],
    milestones: (milestonesRes.data ?? []) as Milestone[],
    links: (linksRes.data ?? []) as MilestoneOffer[],
  }
}

export async function getPublicOfferForSlug(
  slug: string,
  offerId: string
): Promise<{ ownerLabel: string; offer: Offer } | null> {
  const owner = await resolveSlug(slug)
  if (!owner) return null

  const [ownerLabel, offerRes] = await Promise.all([
    resolveOwnerLabel(owner.user_id, owner.full_name),
    supabaseAdmin
      .from('offers')
      .select(OFFER_COLUMNS)
      .eq('id', offerId)
      .eq('user_id', owner.user_id)
      .eq('is_active', true)
      .maybeSingle(),
  ])

  if (!offerRes.data) return null
  return { ownerLabel, offer: offerRes.data as Offer }
}
