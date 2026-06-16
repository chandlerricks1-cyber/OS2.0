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

const invisibleOwner: AvatarConfig = {
  slug: 'invisible-owner',
  avatarNumber: '03',
  name: 'Invisible Owner',
  meta: {
    title: `${PRODUCT_NAME} — Turn Your Empty Feed Into a Lead Machine`,
    description:
      'Your work is incredible — but online you’re a ghost, and it’s costing you jobs. POV Pro turns the work you already do into a daily, trust-building feed. No becoming a content creator.',
    ogTitle: 'When a homeowner Googles you tonight — what do they find?',
    ogDescription:
      'An empty feed is a liability the moment a prospect vets you. POV Pro builds your proof on autopilot — without you becoming a content creator.',
  },
  hero: {
    eyebrow: 'For great operators who are invisible online',
    headline: 'Your work is incredible. Your feed is a',
    headlineAccent: 'ghost town.',
    subhead:
      'POV Pro turns the jobs you already run into daily, trust-building video — no posting schedule to keep, no editing, no becoming an influencer.',
    ctaLabel: 'Book a call → see your 90-day content plan',
    credibility: [
      { value: 'Done-for-you', label: 'You film; we handle the rest' },
      { value: 'Daily proof', label: 'A feed that fills itself' },
      { value: 'No creator skills', label: 'Never become an influencer' },
    ],
  },
  agitation: {
    heading: 'An empty feed is an active liability.',
    blocks: [
      {
        pain: '“We do incredible work, but our Instagram is a graveyard. When people Google us, there’s basically nothing there.”',
        reframe:
          'The moment a prospect vets you, a blank presence screams “risky.” They pick the competitor who simply looks more established.',
        icon: 'Ghost',
      },
      {
        pain: '“I don’t even know what to post — and I don’t have time to become a content creator.”',
        reframe:
          'You don’t need ideas or creator skills. You need a system that turns the work you already do into content for you.',
        icon: 'Search',
      },
      {
        pain: '“I’ve tried posting and it just goes nowhere.”',
        reframe:
          'Random posting goes nowhere. Consistency is the killer — and that’s exactly the part POV Pro runs on your behalf.',
        icon: 'TrendingDown',
      },
    ],
  },
  proof: {
    heading: 'From graveyard to a mountain of evidence',
    seeItems: [
      {
        label: 'Empty feed → mountain of proof',
        detail: 'Ninety days from now a prospect finds a wall of real jobs instead of silence.',
        icon: 'LayoutGrid',
      },
      {
        label: 'What they find when they Google you',
        detail: 'The vetting moment flips in your favor — you look like the established, trusted choice.',
        icon: 'Search',
      },
      {
        label: 'The done-for-you loop',
        detail: 'You film a minute on the job. We edit, post, and keep it consistent. That’s the whole system.',
        icon: 'RefreshCw',
      },
    ],
  },
  objection: {
    masterObjection: '“I can’t become a content creator — I don’t have the time or the skills.”',
    response:
      'You won’t have to. Your only job is about one minute of filming on a job you’re already running. We do the editing, the posting, and the consistency. You get the feed of a content creator without becoming one.',
  },
  faq: {
    masterQuestion: {
      q: 'I’m not a content creator and I don’t have time to become one. Can I still do this?',
      a: 'Yes — that’s the entire point. You film roughly one minute on jobs you’re already doing. POV Pro handles editing, posting, and the daily consistency, so you never have to come up with ideas, learn to edit, or become an influencer.',
    },
  },
  finalCta: {
    promiseHeadline: 'Your empty feed is costing you jobs.',
    promiseAccent: 'Let’s fill it.',
    subtext:
      'Book a call and we’ll map the 90-day content plan that turns your everyday work into a feed that sells for you.',
    ctaLabel: 'Book a call → see your 90-day plan',
  },
}

const cameraShy: AvatarConfig = {
  slug: 'camera-shy',
  avatarNumber: '04',
  name: 'Camera-Shy',
  meta: {
    title: `${PRODUCT_NAME} — Build a Trusted Brand Without Being On Camera`,
    description:
      'Everyone says you should be the face of your business. You hate it. Good — with POV Pro you never have to be. The camera points at the work, not at you.',
    ogTitle: 'You hate being on camera. Good — you never have to be.',
    ogDescription:
      'The best content for your business doesn’t have your face in it. POV Pro points the camera at the work — all the trust, none of the spotlight.',
  },
  hero: {
    eyebrow: 'For owners who freeze at the lens',
    headline: 'You hate being on camera. Good —',
    headlineAccent: 'you never have to be.',
    subhead:
      'POV Pro points the camera at the work, not at you. No talking-head videos, no influencer act — just real footage that builds trust on its own.',
    ctaLabel: 'Book a call',
    credibility: [
      { value: 'Faceless', label: 'The owner never appears' },
      { value: 'No performing', label: 'The work is the star' },
      { value: 'Quiet-tech OK', label: 'Shy techs work even better' },
    ],
  },
  agitation: {
    heading: 'You’ve been sold a false choice.',
    blocks: [
      {
        pain: '“Everyone tells me I need to be on camera. I hate it. So I just… don’t post anything.”',
        reframe:
          'You’ve wrongly equated “doing content” with “being the on-camera personality.” That false choice is the only thing keeping you stuck.',
        icon: 'VideoOff',
      },
      {
        pain: '“I’m not a natural on camera, and I don’t want to be an influencer.”',
        reframe:
          'Then don’t be. POV removes you from the frame entirely — the shot is hands, the reveal, the fix. Nobody has to perform.',
        icon: 'UserX',
      },
      {
        pain: '“My techs won’t want to be on camera either.”',
        reframe:
          'They don’t have to be. Quiet field-techs are often better for this — easier edits, fewer faces on screen, less hassle.',
        icon: 'EyeOff',
      },
    ],
  },
  proof: {
    heading: 'All the trust. None of the spotlight.',
    seeItems: [
      {
        label: 'The work is the star',
        detail: 'Hands, the reveal, the fix — POV reels where you never see a presenter’s face.',
        icon: 'Hand',
      },
      {
        label: 'Owner-optional, face-optional',
        detail: 'You never appear. Even camera-shy techs work — the footage points at the job, not a person.',
        icon: 'Camera',
      },
      {
        label: 'Trust without performing',
        detail: 'The above-and-beyond moment builds trust on its own — no talking head required.',
        icon: 'ShieldCheck',
      },
    ],
  },
  objection: {
    masterObjection: '“I’m just not on-camera material.”',
    response:
      'Perfect — because this isn’t on-camera content. The camera sits on your tech’s head, pointed at the work. No face, no script, no performance. The most trusted content for your business is the kind that never shows you at all.',
  },
  faq: {
    masterQuestion: {
      q: 'Do I — or my techs — have to be on camera or talk to the lens?',
      a: 'No. POV is faceless by design. The camera points at the work — hands, reveals, repairs — not at a presenter. The owner never appears, and quiet techs are often the best fit because the footage is about the job, not a personality.',
    },
  },
  finalCta: {
    promiseHeadline: 'Build a brand people trust —',
    promiseAccent: 'without being the face of it.',
    subtext:
      'Book a call and see how faceless POV content builds all the trust of a personal brand, with none of the spotlight.',
    ctaLabel: 'Book a call',
  },
}

const timeStarved: AvatarConfig = {
  slug: 'time-starved',
  avatarNumber: '06',
  name: 'Time-Starved',
  meta: {
    title: `${PRODUCT_NAME} — The Marketing System That Takes One Minute Per Job`,
    description:
      'No time for content? POV Pro adds about a minute to a job you’re already doing — and hands the editing, posting, and coaching to us. The lowest-effort growth asset you’ll ever own.',
    ogTitle: 'No time for content? This takes one minute per job.',
    ogDescription:
      'You film for 60 seconds. We do the other 99% — editing, posting, coaching. Fully launched in about 8 hours total.',
  },
  hero: {
    eyebrow: 'For owners with zero spare time',
    headline: 'No time for content? This takes',
    headlineAccent: 'one minute per job.',
    subhead:
      'POV Pro adds about a minute to a job you’re already doing — and hands the editing, posting, and coaching to us. The lowest-effort growth asset you’ll ever own.',
    ctaLabel: 'Book a call',
    credibility: [
      { value: '~1 min/job', label: 'The entire ask on your team' },
      { value: 'We do 99%', label: 'Editing, posting, coaching' },
      { value: '~8 hours', label: 'To fully launched' },
    ],
  },
  agitation: {
    heading: 'You’re right to protect your time.',
    blocks: [
      {
        pain: '“I know I should be posting. I do not have ten minutes a day to make videos, let alone edit them.”',
        reframe:
          'You’re assuming content equals a big time sink. POV Pro is engineered for near-zero marginal time — the capture rides on a job you’re already doing.',
        icon: 'Clock',
      },
      {
        pain: '“My techs are slammed too — I can’t add more to their plate.”',
        reframe:
          'Capture is a ~1-minute add-on to a job already in progress. As automatic as buckling a seatbelt — not a new task.',
        icon: 'Users',
      },
      {
        pain: '“Who’s going to manage all of this?”',
        reframe:
          'We are. Editing, posting, and coaching are done for you. There’s nothing to manage on your end.',
        icon: 'Layers',
      },
    ],
  },
  proof: {
    heading: 'Built for people with no spare time',
    seeItems: [
      {
        label: 'One minute per job',
        detail: 'Capture is a 60-second add-on to work you’re already doing — that’s the whole job.',
        icon: 'Timer',
      },
      {
        label: 'You film, we do the rest',
        detail: 'Your slice is tiny. Editing, scheduling, posting, coaching — all on us.',
        icon: 'Split',
      },
      {
        label: '~8 hours to fully launched',
        detail: 'The entire system stands up in about 8 hours total, spread over a few days.',
        icon: 'Zap',
      },
    ],
  },
  objection: {
    masterObjection: '“I don’t have time for this.”',
    response:
      'That’s exactly who this is built for. The only thing on your plate is about one minute of filming per job — on jobs you’re already running. Editing, posting, and coaching are entirely ours. If you can buckle a seatbelt, you have time for this.',
  },
  faq: {
    masterQuestion: {
      q: 'I genuinely have no spare time. How much does this actually take me and my team?',
      a: 'About one minute per job to capture — on a job you’re already doing. Everything else (editing, posting, coaching) is done for you. The full system takes roughly 8 hours total to set up, spread over a few days, and then it runs.',
    },
  },
  finalCta: {
    promiseHeadline: 'You film for 60 seconds.',
    promiseAccent: 'We do the other 99%.',
    subtext:
      'Book a call and see how the lowest-effort growth asset you’ll ever own fits into a day you’re already too busy for.',
    ctaLabel: 'Book a call',
  },
}

const crowdedMarket: AvatarConfig = {
  slug: 'crowded-market',
  avatarNumber: '07',
  name: 'Crowded Market',
  meta: {
    title: `${PRODUCT_NAME} — Stand Out in a Market Where Everyone Looks the Same`,
    description:
      'Forty competitors, the same five claims. You can’t out-tagline them — you can out-trust them. POV Pro makes you the visibly most-trusted option in your market while the window’s open.',
    ogTitle: 'You can’t out-tagline your competition. You can out-trust them.',
    ogDescription:
      'POV content shows the work and the extra care — the one thing a “we’re the best” post can never do. Own the trust game before your market catches on.',
  },
  hero: {
    eyebrow: 'For operators in saturated local markets',
    headline: 'You can’t out-tagline your competition.',
    headlineAccent: 'You can out-trust them.',
    subhead:
      'POV Pro makes you the visibly most-trusted option in your market by showing the work and the extra care — the one thing a competitor’s “we’re the best” post can never do.',
    ctaLabel: 'Book a call → claim your market',
    credibility: [
      { value: 'Visible proof', label: 'Show it, don’t claim it' },
      { value: 'First-mover', label: 'Own the trust game now' },
      { value: 'Inimitable', label: 'A tagline can’t copy this' },
    ],
  },
  agitation: {
    heading: 'Everyone in your market sounds identical.',
    blocks: [
      {
        pain: '“There are 40 roofers in my city and we all say the exact same thing. How do I actually stand apart?”',
        reframe:
          'You’re all competing on identical self-promotional claims homeowners tune out. The differentiator isn’t a better tagline — it’s visible proof.',
        icon: 'Copy',
      },
      {
        pain: '“Everyone’s already on social — how does this make me different?”',
        reframe:
          'They’re posting brand fluff. POV shows the real work and the above-and-beyond moment — something a “we’re the best” post can’t fake.',
        icon: 'Megaphone',
      },
      {
        pain: '“My competitors will just copy it.”',
        reframe:
          'Not fast enough. First mover in your market stacks a mountain of trust while the platform window is wide open.',
        icon: 'Map',
      },
    ],
  },
  proof: {
    heading: 'Out-trust the entire market',
    seeItems: [
      {
        label: '“We’re the best” vs. you',
        detail: 'Identical generic competitor ads on one side — your real POV proof standing out on the other.',
        icon: 'Layers',
      },
      {
        label: 'Own your town',
        detail: 'Stack local proof until you’re the obvious trusted choice across your market.',
        icon: 'MapPin',
      },
      {
        label: 'The window is open now',
        detail: 'Meta is boosting this content and ~1 in 4 has a real shot at traveling — a 2–3 year window before it saturates.',
        icon: 'Clock',
      },
    ],
  },
  objection: {
    masterObjection: '“My competitors will just copy this.”',
    response:
      'Let them try — they’re years behind the moment you start. First mover stacks a mountain of local proof while the window’s open, and the above-and-beyond moment is something no competitor can fake with a tagline. By the time they catch on, you already own the trust in your market.',
  },
  faq: {
    masterQuestion: {
      q: 'What stops my competitors from just copying this?',
      a: 'Time and trust. The first mover in a market stacks months of proof before anyone else starts, and that head start compounds. The trust the above-and-beyond moment earns can’t be faked with a tagline — and the platform window that makes this easy is closing, so late movers get far less reach.',
    },
  },
  finalCta: {
    promiseHeadline: 'Stop saying you’re the best.',
    promiseAccent: 'Show it — and own your market.',
    subtext: 'Book a call and claim the trust game in your market before your competitors catch on.',
    ctaLabel: 'Book a call → claim your market',
  },
}

const systemsScaler: AvatarConfig = {
  slug: 'systems-scaler',
  avatarNumber: '08',
  name: 'Systems-Minded Scaler',
  meta: {
    title: `${PRODUCT_NAME} — A Content Machine That Scales With Your Crew`,
    description:
      'You don’t want a lucky viral video. You want a machine. POV Pro is a documented, replicable system — a fixed shot list, daily and weekly cadences, and a scaling lever that grows output with every tech you add.',
    ogTitle: 'You don’t want a viral video. You want a content machine that scales.',
    ogDescription:
      'Add a tech, add output. POV Pro is a documented system — not a personality play — that scales linearly with your crew.',
  },
  hero: {
    eyebrow: 'For systems-minded operators with a crew',
    headline: 'You don’t want a viral video. You want a',
    headlineAccent: 'machine that scales.',
    subhead:
      'POV Pro is a documented, replicable system — a fixed shot list, daily and weekly cadences, and a simple scaling lever that grows your output with every tech you add.',
    ctaLabel: 'Book a call → see the system',
    credibility: [
      { value: 'Documented', label: 'Scorecards, cadences, roadmap' },
      { value: 'Add a tech', label: 'Add throughput — linearly' },
      { value: 'Its own dept', label: 'Runs as a machine, not luck' },
    ],
  },
  agitation: {
    heading: 'You think in systems. Most content isn’t one.',
    blocks: [
      {
        pain: '“I don’t want a one-off viral hit. I want a repeatable system I can scale as I add techs.”',
        reframe:
          'Most content is ad-hoc, personality-dependent, and unscalable. You want a machine — and that’s exactly what this is.',
        icon: 'Settings',
      },
      {
        pain: '“Will this just depend on one charismatic person?”',
        reframe:
          'No. It’s a replicable system, not a personality play — a fixed shot list and documented cadences anyone on your team follows.',
        icon: 'User',
      },
      {
        pain: '“Can this actually scale across my whole team?”',
        reframe:
          'Yes — linearly. When one tech maxes out, you add gear to another and throughput climbs. Capture is never the bottleneck.',
        icon: 'HelpCircle',
      },
    ],
  },
  proof: {
    heading: 'A machine, not a lucky video',
    seeItems: [
      {
        label: 'Inputs → outputs, documented',
        detail: 'A daily scorecard, a weekly cadence, and a 30-day roadmap. The system runs on process, not luck.',
        icon: 'Workflow',
      },
      {
        label: 'The scaling lever',
        detail: 'One tech maxes out → add gear to another → throughput climbs toward golden-status volume.',
        icon: 'TrendingUp',
      },
      {
        label: 'Becomes its own department',
        detail: 'Eventually it runs as a documented department that scales with headcount.',
        icon: 'Building2',
      },
    ],
  },
  objection: {
    masterObjection: '“Is this scalable, or just a one-off that depends on one person?”',
    response:
      'It’s a documented system, not a personality play. A fixed 7-shot list, a daily inputs scorecard, and a weekly cadence anyone on your team can run. The scaling lever is dead simple: when one tech maxes out, you add gear to another and output climbs linearly. It becomes its own department.',
  },
  faq: {
    masterQuestion: {
      q: 'Is this a repeatable system, or does it depend on one charismatic person and a bit of luck?',
      a: 'It’s a documented, replicable system. Every tech follows the same shot list; a daily scorecard and weekly cadence keep it on the rails. Scaling is mechanical — add gear to another tech and throughput rises linearly. Nothing depends on one personality or a viral fluke.',
    },
  },
  finalCta: {
    promiseHeadline: 'Add a tech, add output.',
    promiseAccent: 'That’s the entire scaling model.',
    subtext:
      'Book a call and we’ll walk you through the documented system — the shot list, the cadences, and the scaling lever.',
    ctaLabel: 'Book a call → see the system',
  },
}

const triedAndQuit: AvatarConfig = {
  slug: 'tried-and-quit',
  avatarNumber: '09',
  name: 'Tried-and-Quit',
  meta: {
    title: `${PRODUCT_NAME} — You Didn’t Fail at Content. You Quit Too Early.`,
    description:
      'You posted for a while, it flopped, you quit. Two real reasons: the wrong content type and quitting before it compounded. POV Pro fixes both with a system that runs the right reps for you.',
    ogTitle: 'You didn’t fail at content. You quit three weeks too early.',
    ogDescription:
      'You were posting the wrong thing, and you stopped before it compounded. POV Pro runs the right reps, daily — and it’s the easiest it’ll ever be to win.',
  },
  hero: {
    eyebrow: 'For owners who tried content and gave up',
    headline: 'You didn’t fail at content. You quit',
    headlineAccent: 'three weeks too early.',
    subhead:
      'POV Pro fixes the two real reasons your first attempt flopped — the wrong content type and quitting before it compounded — with a system that runs the right reps for you, daily.',
    ctaLabel: 'Book a call',
    credibility: [
      { value: 'Right format', label: 'Real POV, not polished fluff' },
      { value: 'It compounds', label: 'Week one clunky, week three clicks' },
      { value: 'Inputs-driven', label: 'Reps you control, not luck' },
    ],
  },
  agitation: {
    heading: 'Content didn’t fail you. Two things did.',
    blocks: [
      {
        pain: '“I tried posting consistently for two months. Barely any views. It just doesn’t work for an industry like mine.”',
        reframe:
          'It works for your industry — the proof is everywhere. You were almost certainly posting the wrong thing: polished and salesy, when real wins.',
        icon: 'RotateCcw',
      },
      {
        pain: '“Content just isn’t for a business like mine.”',
        reframe:
          'You chased outcomes (views) instead of inputs, and judged a system on a few weeks. It didn’t fail — you quit before it compounded.',
        icon: 'ThumbsDown',
      },
      {
        pain: '“How is this any different from what I already did?”',
        reframe:
          'It’s the right format (real POV), it’s input-driven, and it ramps. With the system running the right reps daily, the wins become inevitable.',
        icon: 'CalendarX',
      },
    ],
  },
  proof: {
    heading: 'Why your first attempt flopped',
    seeItems: [
      {
        label: 'It compounds',
        detail: 'Flat early, then it climbs. Week one is clunky; week three clicks. Quitting early is quitting right before the payoff.',
        icon: 'LineChart',
      },
      {
        label: 'Inputs over outcomes',
        detail: 'You control the reps and uploads; the views take care of themselves. The system runs the right reps for you.',
        icon: 'RefreshCw',
      },
      {
        label: 'The window is open now',
        detail: 'Meta is boosting POV and ~1 in 4 has a real shot at traveling. This is the easiest it’ll ever be to win.',
        icon: 'Clock',
      },
    ],
  },
  objection: {
    masterObjection: '“I already tried this and it didn’t work.”',
    response:
      'You tried two things that were broken: the wrong format and an early quit. Polished, salesy content flops — real POV doesn’t. And content compounds, so a few weeks tells you nothing. POV Pro runs the right reps daily, on your behalf, so it actually gets the chance to work this time.',
  },
  faq: {
    masterQuestion: {
      q: 'I already tried posting and it didn’t work — why would this be different?',
      a: 'Two reasons your first attempt likely failed: you were posting polished, salesy content (which gets ignored) and you stopped before it compounded. POV Pro fixes both — it’s the right format (real POV footage) and it runs the right reps daily on your behalf, so it has time to work.',
    },
  },
  finalCta: {
    promiseHeadline: 'Content didn’t fail you.',
    promiseAccent: 'The strategy did.',
    subtext:
      'Book a call and we’ll show you the right reps — run for you, daily — that make this work where your first attempt didn’t.',
    ctaLabel: 'Book a call',
  },
}

const equityMinded: AvatarConfig = {
  slug: 'equity-minded',
  avatarNumber: '10',
  name: 'Equity-Minded',
  meta: {
    title: `${PRODUCT_NAME} — Marketing That Shows Up on Your Balance Sheet`,
    description:
      'Ad spend evaporates the day you stop. POV Pro builds owned, appreciating equity — a content library and audience that compound into real enterprise value, plus a team that grows more valuable.',
    ogTitle: 'Your ad spend evaporates the day you stop. This compounds.',
    ogDescription:
      'Most marketing is rented. POV Pro is owned and appreciating — an asset that makes the business worth more, not just busier.',
  },
  hero: {
    eyebrow: 'For owners building long-term enterprise value',
    headline: 'Your ad spend evaporates the day you stop.',
    headlineAccent: 'This compounds.',
    subhead:
      'POV Pro builds owned, appreciating equity — a content library and audience that compound into real enterprise value, plus a team that grows more skilled and valuable over time.',
    ctaLabel: 'Book a call',
    credibility: [
      { value: 'Owned', label: 'An asset, not rented attention' },
      { value: 'Appreciating', label: 'A library that compounds' },
      { value: 'On the books', label: 'Builds enterprise value' },
    ],
  },
  agitation: {
    heading: 'Most marketing is rented. You want to own.',
    blocks: [
      {
        pain: '“Everything I spend on ads disappears the second I stop. I want marketing that adds value to the business itself.”',
        reframe:
          'Paid ads are rented attention — the value vanishes when spend stops. You want owned, appreciating assets, and that’s a different game.',
        icon: 'Wind',
      },
      {
        pain: '“Isn’t this just more marketing spend?”',
        reframe:
          'No — it’s an asset. Every video is a permanent piece of a library you own that keeps building trust long after it’s posted.',
        icon: 'HelpCircle',
      },
      {
        pain: '“What’s the real long-term value here?”',
        reframe:
          'A year in, an owned library and audience become brand equity with genuine enterprise value — and a more skilled, more valuable team.',
        icon: 'Clock',
      },
    ],
  },
  proof: {
    heading: 'Build the balance sheet, not just the pipeline',
    seeItems: [
      {
        label: 'Rented attention vs. owned asset',
        detail: 'Ad spend evaporates the day you stop. A content library compounds and stays yours.',
        icon: 'Library',
      },
      {
        label: 'The equity stack',
        detail: 'A brand asset that appreciates plus a team that grows more skilled and valuable over time.',
        icon: 'Layers',
      },
      {
        label: 'Worth more at exit',
        detail: 'An owned library and audience is real enterprise value a buyer can see on the books.',
        icon: 'Building2',
      },
    ],
  },
  objection: {
    masterObjection: '“Isn’t this just more marketing spend?”',
    response:
      'No — it’s the opposite. Ad spend is rented; the value disappears when you stop. POV Pro builds an owned, appreciating asset: every video is a permanent piece of a library you keep, that compounds into brand equity and makes the whole business worth more. You’re not buying clicks — you’re stacking an asset.',
  },
  faq: {
    masterQuestion: {
      q: 'How is content an asset and not just another marketing expense?',
      a: 'Ads are rented attention — the value ends when spend ends. POV content is owned: every video is a permanent piece of a library and audience you keep. Over time that library compounds into brand equity with real enterprise value, and your team grows more skilled in the process. It builds the balance sheet, not just the pipeline.',
    },
  },
  finalCta: {
    promiseHeadline: 'Build a marketing asset',
    promiseAccent: 'you actually own.',
    subtext:
      'Book a call and see how POV Pro builds owned, appreciating equity that makes the business worth more — not just busier.',
    ctaLabel: 'Book a call',
  },
}

export const AVATARS: Record<AvatarSlug, AvatarConfig> = {
  'ad-spend-plateau': adSpendPlateau,
  'agency-burned': agencyBurned,
  'fire-the-videographer': fireTheVideographer,
  'invisible-owner': invisibleOwner,
  'camera-shy': cameraShy,
  'time-starved': timeStarved,
  'crowded-market': crowdedMarket,
  'systems-scaler': systemsScaler,
  'tried-and-quit': triedAndQuit,
  'equity-minded': equityMinded,
}

export const AVATAR_SLUGS = Object.keys(AVATARS) as AvatarSlug[]

export function getAvatar(slug: string): AvatarConfig | undefined {
  return AVATARS[slug as AvatarSlug]
}
