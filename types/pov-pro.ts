// Types for the POV Pro avatar landing pages.
//
// An AvatarConfig holds ONLY the avatar-specific slots of the shared page
// skeleton. Everything identical across pages lives in UniversalContent
// (see lib/pov-pro/universal.ts) and is written once.

/** URL slug + config key for each avatar. Adding an avatar = add a slug here. */
export type AvatarSlug =
  | 'ad-spend-plateau'
  | 'agency-burned'
  | 'fire-the-videographer'

/** Icon names are strings in data; mapped to lucide components in iconRegistry. */
export type IconName = string

export interface AvatarMeta {
  /** <title> */
  title: string
  /** <meta name="description"> ~155 chars */
  description: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

export interface CredibilityItem {
  value: string
  label: string
}

export interface AgitationBlock {
  /** Names their pain in their words. */
  pain: string
  /** Reframes / twists it into the root problem. */
  reframe: string
  icon?: IconName
}

export interface SeeItem {
  label: string
  detail?: string
  icon?: IconName
}

export interface FaqItem {
  q: string
  a: string
}

export interface AvatarConfig {
  slug: AvatarSlug
  /** Internal label only (e.g. "05") — not necessarily shown. */
  avatarNumber: string
  /** Short human name, e.g. "Ad-Spend Plateau". */
  name: string
  meta: AvatarMeta

  // 1. Hero
  hero: {
    eyebrow: string
    headline: string
    /** Optional gradient-highlighted span appended to the headline. */
    headlineAccent?: string
    subhead: string
    ctaLabel: string
    credibility: CredibilityItem[]
  }

  // 2. Callout / Agitation
  agitation: {
    heading: string
    blocks: AgitationBlock[]
  }

  // 3. Reframe bridge
  reframe: {
    heading: string
    body: string
  }

  // 5. Proof — avatar-specific SEE items (blended with universal proof)
  proof: {
    heading?: string
    seeItems: SeeItem[]
  }

  // 6. Objection crusher — avatar master objection
  objection: {
    masterObjection: string
    response: string
  }

  // 10. FAQ — avatar master objection as one Q (universal Qs in UniversalContent)
  faq: {
    masterQuestion: FaqItem
  }

  // 11. Final CTA
  finalCta: {
    promiseHeadline: string
    promiseAccent?: string
    subtext: string
    ctaLabel: string
  }
}

// ---- Universal content (identical on every page) ----

export interface MechanismStep {
  step: string
  title: string
  description: string
  icon?: IconName
}

export interface Pillar {
  kind: 'problem' | 'fix' | 'above-and-beyond'
  title: string
  body: string
}

export interface ProofPoint {
  heading: string
  body: string
}

export interface ObjectionDefuser {
  objection: string
  response: string
}

export interface DeliverableItem {
  title: string
  detail?: string
  /** Marks add-ons (e.g. ad-creative repurposing). */
  addOn?: boolean
}

export interface NavLink {
  label: string
  href: string
}

export interface UniversalContent {
  // 4. How POV Pro Works
  howItWorks: {
    heading: string
    subhead: string
    mechanism: MechanismStep[]
    pillars: Pillar[]
    sevenShot: {
      title: string
      body: string
    }
    effortNote: string
  }

  // 5. Why it works — universal proof points
  proof: {
    heading: string
    subhead: string
    points: ProofPoint[]
  }

  // 6. Universal agency-skepticism defusers
  objectionDefusers: {
    heading: string
    subhead: string
    defusers: ObjectionDefuser[]
  }

  // 7. Guarantee
  guarantee: {
    heading: string
    body: string
    /** Short reminder line reused in the final CTA. */
    reminder: string
  }

  // 8. Deliverables
  deliverables: {
    heading: string
    subhead: string
    items: DeliverableItem[]
  }

  // 9. Testimonials — labeled placeholders
  testimonials: {
    heading: string
    subhead: string
    placeholders: string[]
  }

  // 10. Universal FAQ questions (shown after the avatar master question)
  faqUniversal: FaqItem[]

  nav: NavLink[]
  footerTagline: string
}
