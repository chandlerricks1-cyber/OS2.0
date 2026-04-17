export const OFFER_TYPES = [
  'attraction',
  'core',
  'upsell',
  'downsell',
  'continuity',
] as const

export type OfferType = (typeof OFFER_TYPES)[number]

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  attraction: 'Attraction',
  core: 'Core Offer',
  upsell: 'Upsell',
  downsell: 'Downsell',
  continuity: 'Continuity',
}

export const OFFER_TYPE_DESCRIPTIONS: Record<OfferType, string> = {
  attraction: 'Get them in the door',
  core: 'Your flagship offer',
  upsell: 'After they say yes',
  downsell: 'If they say no',
  continuity: 'Keep them paying',
}

export interface Offer {
  id: string
  user_id: string
  name: string
  offer_type: OfferType
  price: string | null
  what_customer_gets: string | null
  why_do_it: string | null
  when_offered: string | null
  trigger: string | null
  sales_pitch: string | null
  thumbnail_url: string | null
  short_description: string | null
  video_url: string | null
  classroom_body: string | null
  sort_order: number
  is_active: boolean
  source: 'manual' | 'crucible_ai'
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  user_id: string
  name: string
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface MilestoneOffer {
  milestone_id: string
  offer_id: string
  sequence: number
}
