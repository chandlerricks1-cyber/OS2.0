import type { UniversalContent } from '@/types/pov-pro'
import { PRODUCT_NAME } from './constants'

// Universal content — written ONCE and shared by every avatar landing page.
// Copy expanded from the brief §3, matched to the owner-to-owner voice (§3.6).
// No fake testimonials / metrics / logos — labeled placeholders only.

export const UNIVERSAL: UniversalContent = {
  howItWorks: {
    heading: `How ${PRODUCT_NAME} works`,
    subhead:
      'A tech wears point-of-view glasses, captures a job in about a minute, and uploads the raw clips. We do the rest — edit, post, and coach your team every week. You capture; we run the machine.',
    mechanism: [
      {
        step: '01',
        title: 'Capture',
        description:
          'A tech wears POV glasses (or runs a small POV camera) and films the real job — about one minute of footage. No script, no setup, no performing.',
        icon: 'Camera',
      },
      {
        step: '02',
        title: 'Upload',
        description:
          'Same-day, the raw clips get dropped straight to us. That is the entire ask on your side — one job, one upload.',
        icon: 'Upload',
      },
      {
        step: '03',
        title: 'We edit',
        description:
          'Our team turns the raw footage into scroll-stopping reels. The editing, captions, and hooks are completely off your plate.',
        icon: 'Scissors',
      },
      {
        step: '04',
        title: 'We post',
        description:
          'We publish on a daily cadence — the consistency that actually builds trust, handled for you.',
        icon: 'Send',
      },
      {
        step: '05',
        title: 'You engage',
        description:
          'You reply to comments and DMs from real local homeowners — and the loop repeats with the next job.',
        icon: 'MessageCircle',
      },
    ],
    pillars: [
      {
        kind: 'problem',
        title: 'The problem',
        body: 'Show the homeowner the issue the way the pro sees it — inside the wall, under the house, on the roof — explained in plain language.',
      },
      {
        kind: 'fix',
        title: 'The fix',
        body: 'Show the work that solves it. Real hands, the real reveal, the actual repair — the part homeowners never get to watch.',
      },
      {
        kind: 'above-and-beyond',
        title: 'Above & beyond',
        body: 'The unasked-for extra care. This is the trust differentiator — it plants "this company goes the extra mile for me" in every viewer. Never skip it.',
      },
    ],
    sevenShot: {
      title: 'The 7-shot field capture system',
      body: 'The exact shots a tech grabs on every job so our editors can always build a winning video. Your tech learns it in their own training track — and after a few jobs it is as automatic as buckling a seatbelt.',
    },
    effortNote:
      'Effort for your tech: about one minute per job. The full system stands up in roughly 8 hours total, spread over a few days.',
  },

  proof: {
    heading: 'Why it works',
    subhead: 'This is not theory. It is how attention and trust actually move right now.',
    points: [
      {
        heading: 'Real beats scripted — every time',
        body: 'Polished brand content reads as an ad and gets scrolled past. Raw POV footage of real work gets watched, trusted, and remembered.',
      },
      {
        heading: 'Show the invisible',
        body: 'Homeowners want to see what the pros see. The reveal under the house or behind the wall is content no "we\'re the best" post can match.',
      },
      {
        heading: 'Ride the platform tailwind',
        body: 'Meta is actively pushing POV/glasses footage right now. You are riding a wave the platform is creating — a roughly 2–3 year window before it saturates, with about 1 in 4 of these videos having a real shot at traveling.',
      },
      {
        heading: 'Compounds with your paid ads',
        body: 'Organic POV content surrounds your ads with proof, so the same ad dollar converts better. Your best organic videos become your best ad creative.',
      },
      {
        heading: 'Inputs over outcomes',
        body: 'You control the reps, the uploads, and the engagement — views follow. The system is built on daily non-negotiables, not luck.',
      },
    ],
  },

  objectionDefusers: {
    heading: 'How this is different from an agency',
    subhead: 'Most home-service owners have been burned by a black-box retainer. Here is the opposite.',
    defusers: [
      {
        objection: 'Total transparency',
        response:
          'Every deliverable is named and visible. No vague "social media management" you can never see inside.',
      },
      {
        objection: 'You own the asset',
        response:
          'The content library and the audience are yours — not rented from an agency that can walk away with them.',
      },
      {
        objection: 'Completely different content',
        response:
          'This is real job footage, not the glossy brand-fluff agencies produce that homeowners scroll right past.',
      },
      {
        objection: 'Skin in the game',
        response:
          'Our guarantee puts the risk on us. We only win when you get finished content for every job you submit.',
      },
      {
        objection: 'Outcomes, not vanity metrics',
        response:
          'We talk in leads and booked jobs — not impressions and "engagement."',
      },
    ],
  },

  guarantee: {
    heading: 'The guarantee',
    body: `In your first month, you get at least one finished, ready-to-post video for every job you submit. We expect 15–30 job submissions a month — and we turn every single one into content.`,
    reminder: 'A finished video for every job you submit — guaranteed.',
  },

  deliverables: {
    heading: 'Exactly what you get',
    subhead: 'Everything named in writing. This is the anti-black-box list.',
    items: [
      {
        title: 'Technician training',
        detail: 'The full capture system plus each tech\'s own training track.',
      },
      {
        title: 'Done-for-you editing',
        detail: 'Every job\'s footage cut into ready-to-post reels — captions, hooks, the works.',
      },
      {
        title: 'Daily posting',
        detail: 'Published on a consistent cadence so nothing slips.',
      },
      {
        title: 'Weekly coaching & content review',
        detail: 'We review what\'s working and tune the next week\'s reps with your team.',
      },
      {
        title: 'A daily inputs scorecard',
        detail: 'Reps, uploads, and engagement tracked so the system stays on the rails.',
      },
      {
        title: 'A weekly cadence system',
        detail: 'The operating rhythm that keeps content shipping without you chasing it.',
      },
      {
        title: 'Repurposing winners into ad creative',
        detail: 'Your best organic videos turned into proven paid creative.',
        addOn: true,
      },
    ],
  },

  testimonials: {
    heading: 'Real businesses. Real organic results.',
    subhead: 'Home-service companies running the POV content system — and the views and leads it brings in.',
  },

  faqUniversal: [
    {
      q: 'Do I have to be on camera?',
      a: 'No. The camera points at the work, not at you. A tech wears the glasses and the footage is hands, reveals, and fixes — no talking-head required.',
    },
    {
      q: 'How much time does this take me and my techs?',
      a: 'About one minute per job for the tech, on a job they\'re already running. Editing, posting, and coaching are done for you. The whole system stands up in roughly 8 hours total.',
    },
    {
      q: 'Who handles the editing and posting?',
      a: 'We do — all of it. You capture and upload; we edit every clip into a finished reel and post it on a daily cadence.',
    },
    {
      q: 'What if a video doesn\'t go viral?',
      a: 'The system is built on inputs, not luck. You control the reps and uploads; views follow over time. The guarantee is finished content for every job — not a specific view count.',
    },
  ],

  nav: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Proof', href: '#proof' },
    { label: 'What you get', href: '#deliverables' },
    { label: 'FAQ', href: '#faq' },
  ],

  footerTagline: 'Real job footage → trust → leads.',
}
