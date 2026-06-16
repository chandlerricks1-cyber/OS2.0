import type { AvatarConfig, AvatarSlug } from '@/types/pov-pro'
import { PRODUCT_NAME } from './constants'

// One entry per avatar. Adding a new avatar = add a slug to AvatarSlug (in
// types/pov-pro.ts) and a config here. The route, metadata, and full page are
// generated automatically — no component changes.

const adSpendPlateau: AvatarConfig = {
  slug: 'ad-spend-plateau',
  avatarNumber: '05',
  name: 'Ad-Spend Plateau',
  meta: {
    title: `${PRODUCT_NAME} — Lower Your Cost Per Lead With Organic Trust`,
    description:
      'Your cost per lead is climbing because your ads are cold. POV Pro wraps your paid ads in organic proof — lowering CPL and turning your best videos into your best ad creative.',
    ogTitle: 'Your cost per lead is climbing because your ads are cold.',
    ogDescription:
      'The cheapest way to lower your CAC isn\'t a better ad — it\'s organic trust around it. See how POV Pro makes every ad dollar work harder.',
  },
  hero: {
    eyebrow: 'For owners already spending $2k–$30k+/mo on ads',
    headline: 'Your cost per lead is climbing because your ads are',
    headlineAccent: 'cold.',
    subhead:
      'POV Pro wraps your paid ads in organic proof — lowering cost per lead, shortening payback, and turning your best organic videos into your best-performing ad creative.',
    ctaLabel: 'Book a call → map your ad ROI flywheel',
    credibility: [
      { value: 'Lower CPL', label: 'Warm the click before and after' },
      { value: 'Faster payback', label: 'Shorten your CAC payback window' },
      { value: 'Proven creative', label: 'Your organic winners become ads' },
    ],
  },
  agitation: {
    heading: 'You feel the squeeze. You just can\'t find the lever.',
    blocks: [
      {
        pain: '"My cost per lead won\'t stop climbing, and the leads I do get close worse. The ads just don\'t hit like they used to."',
        reframe:
          'Your ads aren\'t broken. They\'re cold. A prospect clicks, checks you out, finds a thin or salesy presence — nothing to trust — and bounces.',
        icon: 'TrendingUp',
      },
      {
        pain: 'Every month the same budget buys fewer booked jobs, so you pour in more spend just to stand still.',
        reframe:
          'No social proof means a higher CPL and a longer CAC payback. You\'re paying to overcome zero trust on every single click.',
        icon: 'DollarSign',
      },
      {
        pain: 'You\'re guessing at creative — boosting whatever the agency hands you and hoping it lands.',
        reframe:
          'You already have proven creative. You just haven\'t made it yet — it\'s the organic winners your own jobs would produce.',
        icon: 'Target',
      },
    ],
  },
  proof: {
    heading: 'Why this fixes your ad math',
    seeItems: [
      {
        label: 'The ad ROI flywheel',
        detail: 'Capture → organic winners → ads → leads → revenue → more content. It spins faster every month.',
        icon: 'RefreshCw',
      },
      {
        label: 'Cold vs warmed-by-organic',
        detail: 'The same ad converts a stranger and a prospect who\'s already seen six pieces of your proof very differently.',
        icon: 'Flame',
      },
      {
        label: 'Proven organic → ad creative',
        detail: 'Stop guessing. The videos that already traveled organically become the creative you scale with spend.',
        icon: 'Sparkles',
      },
    ],
  },
  objection: {
    masterObjection: '"Organic is too slow to fix my ad costs."',
    response:
      'It isn\'t — because it improves the spend you\'re already making, immediately. The moment your ads are surrounded by organic proof, the same clicks convert better. And repurposing your organic winners into ad creative upgrades your paid performance right away, not in six months.',
  },
  faq: {
    masterQuestion: {
      q: 'I need leads now — isn\'t organic too slow to fix my ad costs?',
      a: 'POV Pro works on the spend you\'re already running. Surrounding your ads with organic proof lifts conversion on today\'s clicks, and your best organic videos get repurposed into ad creative — improving paid performance immediately, not months from now.',
    },
  },
  finalCta: {
    promiseHeadline: 'Stop buying cold clicks.',
    promiseAccent: 'Surround your ads with proof.',
    subtext:
      'Map your ad ROI flywheel on a 15-minute call and see exactly how organic POV content lowers your cost per lead.',
    ctaLabel: 'Book a call → map your flywheel',
  },
}

const agencyBurned: AvatarConfig = {
  slug: 'agency-burned',
  avatarNumber: '01',
  name: 'Agency-Burned',
  meta: {
    title: `${PRODUCT_NAME} — The Opposite of the Agency That Burned You`,
    description:
      'You didn\'t get burned by content. You got burned by a black box. Every deliverable named in writing, a guarantee that puts the risk on us, and content homeowners actually trust.',
    ogTitle: 'You didn\'t get burned by content. You got burned by a black box.',
    ogDescription:
      'Fire the agency. Keep the leads. Every deliverable named in writing — and you own the asset, not us.',
  },
  hero: {
    eyebrow: 'For owners burned by a black-box agency',
    headline: 'You didn\'t get burned by content. You got burned by a',
    headlineAccent: 'black box.',
    subhead:
      'Every deliverable named in writing, a guarantee that puts the risk on us, and content homeowners actually trust — not another retainer for vanity metrics.',
    ctaLabel: 'Book a 15-minute walkthrough',
    credibility: [
      { value: 'In writing', label: 'Every deliverable named' },
      { value: 'You own it', label: 'The library and audience are yours' },
      { value: 'Risk on us', label: 'A written month-one guarantee' },
    ],
  },
  agitation: {
    heading: 'You know this story.',
    blocks: [
      {
        pain: '"I paid an agency three grand a month for six months and have nothing to show for it. I couldn\'t even tell you what they did."',
        reframe:
          'You didn\'t get burned by content. You got burned by a black box — sold motion, not a machine, and you could never see inside it.',
        icon: 'Box',
      },
      {
        pain: 'Dashboards full of "reach" and "engagement." Zero tracked leads. No idea what you were actually paying for.',
        reframe:
          'Black-box agencies sell activity, not outcomes — and produce polished brand content homeowners read as ads and ignore. No trust, no leads.',
        icon: 'BarChart3',
      },
      {
        pain: 'Now you\'re allergic to retainers, and you should be. You\'re not signing up to be disappointed again.',
        reframe:
          'Good. This is the opposite of that — total transparency, content that actually builds trust, and the risk on us instead of you.',
        icon: 'ShieldCheck',
      },
    ],
  },
  proof: {
    heading: 'What an agency gives you vs. what you get',
    seeItems: [
      {
        label: 'Named deliverables, not "management"',
        detail: 'Every single thing we do is listed in writing — the opposite of a vague monthly retainer.',
        icon: 'ListChecks',
      },
      {
        label: 'Real footage, not glossy showreels',
        detail: 'Homeowners trust raw job footage. They tune out the polished brand content the last agency sold you.',
        icon: 'Video',
      },
      {
        label: 'You own the library and audience',
        detail: 'Build an asset that stays yours — not one you rent and lose the day you stop paying.',
        icon: 'KeyRound',
      },
    ],
  },
  objection: {
    masterObjection: '"This is just another agency."',
    response:
      'It\'s the opposite of one. Every deliverable is named in writing — no hidden "management." The content is real job footage, not the brand-fluff that burned you. There\'s a written guarantee that puts the risk on us. And you own the library and the audience outright. An agency rents you activity; we hand you an asset.',
  },
  faq: {
    masterQuestion: {
      q: 'How is this different from the agency that already burned me?',
      a: 'Three ways. Transparency: every deliverable is named in writing, nothing hidden. Content: real job footage homeowners trust, not glossy ads they ignore. Risk: a written month-one guarantee that puts the work on us. And you own the asset — the library and audience are yours, not ours.',
    },
  },
  finalCta: {
    promiseHeadline: 'Fire the agency.',
    promiseAccent: 'Keep the leads.',
    subtext:
      'A 15-minute walkthrough — every deliverable named, the guarantee in writing, and the content that actually books jobs.',
    ctaLabel: 'Book a 15-minute walkthrough',
  },
}

const fireTheVideographer: AvatarConfig = {
  slug: 'fire-the-videographer',
  avatarNumber: '02',
  name: 'Fire-the-Videographer',
  meta: {
    title: `${PRODUCT_NAME} — Stop Paying For Pretty. Start Getting Booked.`,
    description:
      'Your videographer makes you look good — but are they making you money? Real job footage out-performs studio-polished content for a fraction of the cost, with editing done for you.',
    ogTitle: 'Your videographer makes you look good. Are they making you money?',
    ogDescription:
      'Polished content is the reason you\'re not getting leads. Real beats scripted — every single time. See the teardown.',
  },
  hero: {
    eyebrow: 'For owners paying a videographer or SMM with nothing to show',
    headline: 'Your videographer makes you look good. Are they making you',
    headlineAccent: 'money?',
    subhead:
      'Real job footage your techs already capture out-performs studio-polished content — for a fraction of what you\'re paying, with the editing done for you.',
    ctaLabel: 'Book a free teardown of your content',
    credibility: [
      { value: 'A fraction', label: 'Of a videographer\'s salary or retainer' },
      { value: 'Same cadence', label: 'Daily posting, done for you' },
      { value: 'Actually books', label: 'Content homeowners trust, not skip' },
    ],
  },
  agitation: {
    heading: 'The feed looks great. The phone isn\'t ringing.',
    blocks: [
      {
        pain: '"My social media person posts every day, the feed looks great, and it hasn\'t brought in one lead. I\'m paying for this — for what?"',
        reframe:
          'The format is wrong, not the effort. Polished, scripted, brand-centric content looks like an ad — so homeowners scroll right past it.',
        icon: 'Clapperboard',
      },
      {
        pain: 'You\'re paying a salary or retainer for production that\'s slow, expensive, and bottlenecked on one person.',
        reframe:
          'Your techs already capture better raw material for roughly $0 marginal cost. The expensive studio pipeline is the problem, not the answer.',
        icon: 'Wallet',
      },
      {
        pain: '"Honestly, my content already looks more professional than this raw stuff."',
        reframe:
          'That\'s exactly why it\'s failing. Homeowners\' brains file branded, polished video as an ad in two seconds and keep scrolling. Real beats scripted.',
        icon: 'EyeOff',
      },
    ],
  },
  proof: {
    heading: 'Why polished loses to real',
    seeItems: [
      {
        label: 'Flatline vs. climbing',
        detail: 'The polished "ad" reel flatlines while the raw POV reel\'s view counter climbs — same company, same week.',
        icon: 'LineChart',
      },
      {
        label: 'The ad-blindness reflex',
        detail: 'Branding cues tell the brain "this is an ad" — and the thumb scrolls before the message ever lands.',
        icon: 'ScanEye',
      },
      {
        label: 'A fraction of the cost',
        detail: 'No videographer salary, no retainer, no shoot scheduling. Your techs capture; we edit and post.',
        icon: 'PiggyBank',
      },
    ],
  },
  objection: {
    masterObjection: '"Raw looks less professional than what I already have."',
    response:
      'That\'s the point. "Professional" is exactly what gets your content filed as an ad and skipped. Put your polished reel next to a raw POV reel from the same company and watch the raw one\'s views climb while the polished one flatlines. Homeowners don\'t want a commercial — they want to see the real work.',
  },
  faq: {
    masterQuestion: {
      q: 'Won\'t raw footage look less professional than what my videographer makes?',
      a: 'It will look less like an ad — and that\'s why it works. Homeowners\' brains file polished, branded video as a commercial and scroll past. Raw POV footage of real work gets watched and trusted. Side by side, the raw reel out-performs the polished one almost every time.',
    },
  },
  finalCta: {
    promiseHeadline: 'Stop paying for pretty.',
    promiseAccent: 'Start getting booked.',
    subtext:
      'Book a free teardown of your current content and see exactly why it isn\'t converting — and what to run instead.',
    ctaLabel: 'Book a free content teardown',
  },
}

export const AVATARS: Record<AvatarSlug, AvatarConfig> = {
  'ad-spend-plateau': adSpendPlateau,
  'agency-burned': agencyBurned,
  'fire-the-videographer': fireTheVideographer,
}

export const AVATAR_SLUGS = Object.keys(AVATARS) as AvatarSlug[]

export function getAvatar(slug: string): AvatarConfig | undefined {
  return AVATARS[slug as AvatarSlug]
}
