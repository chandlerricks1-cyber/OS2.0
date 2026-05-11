'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { Logo } from '@/components/shared/Logo'
import {
  Star,
  Plus,
  Minus,
  ChevronRight,
  X,
  Home,
  FileCheck,
  FileText,
  Mail,
  Landmark,
  ClipboardList,
  Clock,
  Banknote,
  Smartphone,
  CheckCircle2,
  Zap,
  UserPlus,
  PhoneCall,
  ScrollText,
  Send,
  ScanLine,
  BadgeCheck,
  Sparkles,
} from 'lucide-react'

const BOOKING_IFRAME_SRC = 'https://start.cruciblecoaching.org/widget/booking/n6ep2x22ahM8EnsfIsKk'
const BOOKING_IFRAME_ID = 'n6ep2x22ahM8EnsfIsKk_1778162284873'

const rotatingPhrases = [
  'Stop waiting on mortgage companies',
  'Cash insurance checks the same day',
  'Eliminate mortgage holds forever',
]

const stats = [
  { value: '3 hours to setup', label: 'Setup time from start to finish' },
  { value: 'Same day', label: 'Check deposits after setup' },
  { value: '$0', label: "Ongoing fees — one-time setup, that's it" },
]

const steps = [
  {
    step: '01',
    title: 'Book a call with our team',
    description:
      "We walk you through the process, confirm you qualify, and answer any questions. If you're a good fit, we get started immediately. Takes about 15 minutes.",
  },
  {
    step: '02',
    title: 'We connect you with our banking partner',
    description:
      "We introduce you directly to our banking partner's business development rep. They handle the paperwork, underwriting, and account setup — we make sure everything moves fast and nothing falls through the cracks.",
  },
  {
    step: '03',
    title: 'Start depositing checks the same day you get them',
    description:
      'Once approved, you have a third-party indemnification agreement in place for the life of your business. No more mortgage holds. No more certified mail. No more waiting. Just deposit and move on.',
  },
]

const oldWaySteps = [
  { Icon: Home, label: 'Land insurance restoration job' },
  { Icon: FileCheck, label: 'Get claim approved' },
  { Icon: FileText, label: 'Insurance sends check', sub: 'Homeowner + mortgage company listed' },
  { Icon: Mail, label: 'Mail check via certified mail', sub: 'Days after picking it up' },
  { Icon: Landmark, label: 'Mortgage co. holds your funds', sub: 'Until full job is completed' },
  { Icon: ClipboardList, label: 'Send 2x the reports', sub: 'Progress + completion to insurance AND mortgage' },
  { Icon: Clock, label: 'Mortgage releases funds', sub: '3–5 weeks after landing the job' },
  { Icon: Banknote, label: 'You finally get paid', sub: '5–6 weeks on average' },
]

const newWaySteps = [
  { Icon: Home, label: 'Land insurance restoration job' },
  { Icon: FileCheck, label: 'Get claim approved' },
  { Icon: FileText, label: 'Pick up check from homeowner', sub: 'Homeowner + mortgage company listed' },
  { Icon: Smartphone, label: 'Remote deposit into your TPI account', sub: 'Same day — no endorsements needed' },
  { Icon: Banknote, label: 'Funds available within 24 hours' },
  { Icon: CheckCircle2, label: 'Done.' },
]

const timelineSteps = [
  { Icon: UserPlus, label: 'Sign up for the Crucible TPI process' },
  { Icon: PhoneCall, label: '15-min onboarding call', sub: 'Prep your documentation' },
  { Icon: Landmark, label: 'Set up account with verified banking partner' },
  { Icon: ScrollText, label: 'Review & improve your existing agreements' },
  { Icon: Send, label: 'Submit documents for TPI application' },
  { Icon: ScanLine, label: 'Set up your remote deposit machine' },
  { Icon: BadgeCheck, label: 'Get approved for the TPI process' },
  { Icon: Sparkles, label: 'Cash your checks instantly.', sub: 'Forever.' },
]

const features = [
  {
    title: 'Cash Checks Without Endorsements',
    description:
      "Deposit multi-party insurance checks — including those made out to the mortgage company — without needing their signature or the homeowner's. The indemnification agreement handles it.",
  },
  {
    title: 'Eliminate Weeks of Float',
    description:
      "Stop waiting 30, 60, 90+ days for mortgage companies to release your money. Once you're set up, funds hit your account the same day or next business day.",
  },
  {
    title: 'One-Time Setup, Lifetime Access',
    description:
      "This isn't a subscription. There are no transaction fees, no per-check charges, no recurring costs. You set it up once with our banking partner and it works for the life of your business.",
  },
  {
    title: 'We Handle the Hard Part',
    description:
      "You don't need to find the right bank, negotiate the arrangement, or figure out the paperwork. We've already built the relationship. You just show up with your docs and we handle the rest.",
  },
]

const testimonials = [
  {
    company: 'Ikon Roofing',
    location: 'Utah',
    website: 'ikonroof.com',
    logo: 'https://images.squarespace-cdn.com/content/v1/646d2fbe9c001915b1f0c660/c204fd8b-9295-48fb-a27c-5b8486f066cd/ikon_logo_white_text.png?format=300w',
    logoBg: 'bg-page-dark',
    revenue: '$17M',
    years: '2.2 yrs',
    quote:
      "We've processed $17M through this in just over two years. Before TPI we had six figures sitting in mortgage holds at any given time — now every check we touch hits the account same-day. Total game changer for cash flow.",
    name: 'Conner',
    title: 'Owner, Ikon Roofing',
  },
  {
    company: 'FBC Roofing',
    location: 'Utah',
    website: 'fbcroofing.com',
    logo: 'https://static.wixstatic.com/media/e61cf0_7b8f5da8e12648688d7ed45de8c53cbe~mv2.png/v1/fill/w_180,h_180,lg_1,usm_0.66_1.00_0.01/e61cf0_7b8f5da8e12648688d7ed45de8c53cbe~mv2.png',
    logoBg: 'bg-white',
    revenue: '$34M',
    years: '4.5 yrs',
    quote:
      "$34M and four and a half years in — we haven't waited on a single mortgage company endorsement since the day we got set up. The system paid for itself in the first week and I can't imagine running the business without it now.",
    name: 'Adam',
    title: 'Owner, FBC Roofing',
  },
  {
    company: 'Bloque Restoration',
    location: 'Arizona',
    website: 'bloquerestoration.com',
    logo: 'https://graph.facebook.com/bloquerestoration/picture?type=large',
    logoBg: 'bg-white',
    revenue: '$4M',
    years: '1.1 yrs',
    quote:
      "In our first year we pushed $4M through with zero mortgage holds. I wish I'd had this from day one — it would've saved us months of cash flow we didn't have to spare as a newer shop trying to scale.",
    name: 'Payson',
    title: 'Owner, Bloque Restoration',
  },
  {
    company: 'Advosy Construction',
    location: 'Arizona',
    website: 'advosy.com',
    logo: 'https://www.advosy.com/apple-touch-icon.png',
    logoBg: 'bg-white',
    revenue: '$7M',
    years: '1.5 yrs',
    quote:
      "$7M cashed without my team chasing a single mortgage company endorsement. We freed up an entire admin role that used to exist just to manage that paperwork. The math is absurd — I'd pay 10x for this.",
    name: 'Brett',
    title: 'Owner, Advosy Construction',
  },
]

const faqs = [
  {
    q: 'Is this actually legal?',
    a: 'Yes. The bank executes an agreement with your company that allows them to process multi-party checks on your behalf, specifically without the need for endorsements from parties listed on the check. Since you hold a valid Assignment of Benefits or Direction to Pay from the homeowner, you have a lawful right to the funds. The agreements Crucible will help you implement simply releases the bank from liability — the same way the bank protects itself in any commercial deposit scenario.',
  },
  {
    q: 'What kind of checks can I deposit without endorsement?',
    a: "Any multi-party insurance proceeds check where your company has a valid contractual right to the funds — including checks that name the mortgage company as an additionally insured party. You won't need the mortgage company's endorsement or the homeowner's endorsement once the arrangement is in place.",
  },
  {
    q: 'How long does the setup take?',
    a: "About 5-7 days from the time you provide all required documentation to our banking partner. We'll tell you exactly what's needed upfront so there's no guesswork or delays on your end.",
  },
  {
    q: 'What does it cost?',
    a: "$3,000 one-time setup fee, split into two payments: $1,500 at signing and $1,500 once you're approved. No recurring fees. No per-check charges. No transaction costs. Ever.",
  },
  {
    q: 'Do I need to switch banks?',
    a: "You'll set up a business account with our banking partner specifically for depositing insurance proceeds checks. You can keep your existing bank accounts for everything else — payroll, operating expenses, whatever. This is an additional account, not a replacement.",
  },
  {
    q: 'Who qualifies for this?',
    a: "You need to be a licensed roofing or restoration contractor, in business for at least 12 months, doing at least $500K in annual revenue, and able to provide 3–6 months of bank statements. Your business needs to be in good standing with a reasonable public reputation. If you're not sure whether you qualify, book a call and we'll tell you in 5 minutes.",
  },
  {
    q: 'What happens after setup is complete?',
    a: "You work directly with your assigned business development representative at the bank for any ongoing questions. Crucible's job is to get you set up, confirmed, and operational — after that, the arrangement runs on its own for the life of your business. No maintenance, no renewals, no ongoing involvement from us required.",
  },
  {
    q: "What if I don't get approved?",
    a: "If you meet the eligibility requirements and submit everything on time but still get denied for reasons outside your control, we'll either work with the bank to resolve it or refund a portion of your initial payment. We're not in the business of collecting fees for setups that don't go through.",
  },
]

export default function MortgageHoldsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [bookingOpen, setBookingOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % rotatingPhrases.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!bookingOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBookingOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [bookingOpen])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ── Floating Nav ─────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-nav px-6 py-3 flex items-center justify-between">
          <Logo height={68} />
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-page-muted hover:text-page-dark transition-colors">
              How It Works
            </a>
            <a href="#what-you-get" className="text-sm text-page-muted hover:text-page-dark transition-colors">
              What You Get
            </a>
            <a href="#faq" className="text-sm text-page-muted hover:text-page-dark transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="btn-gradient text-sm px-5 py-2.5"
            >
              Book Your Call
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gradient-start/10 to-brand-gradient-end/10 border border-brand-gradient-end/20 text-brand-gradient-end text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-brand-gradient-end rounded-full" />
            For Roofers &amp; Restoration Contractors
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[56px] font-black text-page-dark leading-[1.08] tracking-tight mb-6">
            <span className="block">Mortgage holds, solved.</span>
            <span
              className="block mt-2 min-h-[1.2em] relative"
              aria-live="polite"
            >
              {rotatingPhrases.map((phrase, i) => (
                <span
                  key={i}
                  className="absolute inset-0 flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end transition-all duration-700 ease-in-out"
                  style={{
                    opacity: phraseIdx === i ? 1 : 0,
                    transform: phraseIdx === i ? 'translateY(0)' : 'translateY(12px)',
                  }}
                >
                  {phrase}
                </span>
              ))}
              {/* Invisible spacer to reserve height */}
              <span className="invisible">{rotatingPhrases[0]}</span>
            </span>
          </h1>

          <p className="text-lg text-page-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Crucible sets up a series of agreements so you can deposit multi-party insurance checks —
            without chasing mortgage company endorsements, mailing certified letters, or waiting weeks
            to get paid for work you already completed.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="btn-gradient px-10 py-4 text-base"
            >
              Book Your Call to Start
            </button>
            <a
              href="#how-it-works"
              className="text-page-muted hover:text-page-dark px-6 py-4 font-medium text-base transition-colors flex items-center gap-1"
            >
              How it works <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="mt-10">
            <span className="inline-block text-xs text-page-muted bg-gray-50 border border-gray-100 px-4 py-2 rounded-full">
              See how contractors are eliminating mortgage holds in under 2 minutes
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto scroll-reveal">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-[20px] p-8 shadow-card-soft text-center"
              >
                <div className="text-4xl font-black text-page-dark">{stat.value}</div>
                <div className="text-sm text-page-muted mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-20 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-lg text-page-muted max-w-xl mx-auto">
              Three steps from first call to cashing checks without mortgage holds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <div
                key={item.step}
                className="scroll-reveal bg-white rounded-[25px] p-8 shadow-card-soft border border-gray-100"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-brand-gradient-start to-brand-gradient-end leading-none mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-page-dark mb-3">{item.title}</h3>
                <p className="text-page-muted text-base leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Old Way vs New Way ───────────────────────── */}
      <section className="bg-gray-50 py-20 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
              Mortgage holds are costing you weeks of cash flow.
            </h2>
            <p className="text-lg text-page-muted max-w-xl mx-auto">
              The old way vs. the way Crucible sets you up to get paid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

            {/* Old Way */}
            <div className="scroll-reveal bg-red-50/40 rounded-[25px] p-7 sm:p-8 border border-red-100">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-red-200/70">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-[#E24B4A]" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold text-[#E24B4A]">The old way</h3>
              </div>

              <div className="relative">
                {oldWaySteps.map(({ Icon, label, sub }, i) => (
                  <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < oldWaySteps.length - 1 && (
                      <span className="absolute left-[19px] top-10 bottom-0 w-px bg-red-200" />
                    )}
                    <div className="relative z-10 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#E24B4A]" />
                    </div>
                    <div className="pt-1.5">
                      <div className="font-semibold text-page-dark text-[15px] leading-snug">
                        {label}
                      </div>
                      {sub && (
                        <div className="text-sm text-page-muted mt-1 leading-snug">{sub}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 bg-red-100/70 text-[#E24B4A] rounded-2xl px-5 py-4">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <span className="font-bold text-[15px]">5–6 weeks to get your money</span>
              </div>
            </div>

            {/* New Way */}
            <div className="scroll-reveal bg-emerald-50/40 rounded-[25px] p-7 sm:p-8 border border-emerald-100" style={{ transitionDelay: '100ms' }}>
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-emerald-200/70">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#1D9E75]" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-[#1D9E75]">The new way</h3>
              </div>

              <div className="relative">
                {newWaySteps.map(({ Icon, label, sub }, i) => (
                  <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < newWaySteps.length - 1 && (
                      <span className="absolute left-[19px] top-10 bottom-0 w-px bg-emerald-200" />
                    )}
                    <div className="relative z-10 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#1D9E75]" />
                    </div>
                    <div className="pt-1.5">
                      <div className="font-semibold text-page-dark text-[15px] leading-snug">
                        {label}
                      </div>
                      {sub && (
                        <div className="text-sm text-page-muted mt-1 leading-snug">{sub}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 bg-emerald-100/70 text-[#1D9E75] rounded-2xl px-5 py-4">
                <Zap className="w-5 h-5 flex-shrink-0" />
                <span className="font-bold text-[15px]">Same-day deposit, every time</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 8-Step Timeline ──────────────────────────── */}
      <section className="bg-white py-20 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gradient-start/10 to-brand-gradient-end/10 border border-brand-gradient-end/20 text-brand-gradient-end text-xs font-semibold px-4 py-2 rounded-full mb-5 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 bg-brand-gradient-end rounded-full" />
              The full process
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
              From sign-up to same-day deposits in 8 steps.
            </h2>
            <p className="text-lg text-page-muted max-w-xl mx-auto">
              Exactly what happens from the moment you book your call to the day you cash your first check.
            </p>
          </div>

          {/* Desktop / tablet: horizontal timeline */}
          <div className="hidden md:block scroll-reveal">
            <div className="relative">
              {/* connecting rail */}
              <div className="absolute top-7 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-gradient-start/30 via-brand-gradient-end/40 to-brand-gradient-end/80" />

              <div className="grid grid-cols-8 gap-2 lg:gap-3 relative">
                {timelineSteps.map(({ Icon, label, sub }, i) => {
                  const isLast = i === timelineSteps.length - 1
                  return (
                    <div key={i} className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-card-soft border-2 ${
                            isLast
                              ? 'bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end border-white text-white'
                              : 'bg-white border-brand-gradient-end/30 text-brand-gradient-end'
                          }`}
                        >
                          <Icon className="w-6 h-6" strokeWidth={2.25} />
                        </div>
                        <div
                          className={`absolute -top-1 -right-1 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shadow-sm ${
                            isLast
                              ? 'bg-page-dark text-white'
                              : 'bg-page-dark text-white'
                          }`}
                        >
                          {i + 1}
                        </div>
                      </div>
                      <div className="px-1">
                        <div className="text-[13px] lg:text-sm font-bold text-page-dark leading-snug">
                          {label}
                        </div>
                        {sub && (
                          <div className={`text-xs mt-1 leading-snug ${isLast ? 'text-brand-gradient-end font-semibold' : 'text-page-muted'}`}>
                            {sub}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mobile: vertical timeline */}
          <div className="md:hidden scroll-reveal bg-white rounded-[25px] p-7 shadow-card-soft border border-gray-100">
            <div className="relative">
              {timelineSteps.map(({ Icon, label, sub }, i) => {
                const isLast = i === timelineSteps.length - 1
                return (
                  <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < timelineSteps.length - 1 && (
                      <span className="absolute left-[23px] top-12 bottom-0 w-px bg-brand-gradient-end/30" />
                    )}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          isLast
                            ? 'bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end border-white text-white shadow-card-soft'
                            : 'bg-white border-brand-gradient-end/30 text-brand-gradient-end'
                        }`}
                      >
                        <Icon className="w-5 h-5" strokeWidth={2.25} />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-page-dark text-white text-[10px] font-black flex items-center justify-center">
                        {i + 1}
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="text-[15px] font-bold text-page-dark leading-snug">
                        {label}
                      </div>
                      {sub && (
                        <div className={`text-sm mt-1 leading-snug ${isLast ? 'text-brand-gradient-end font-semibold' : 'text-page-muted'}`}>
                          {sub}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-12 text-center scroll-reveal">
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="btn-gradient px-10 py-4 text-base"
            >
              Start at Step 1 — Book Your Call
            </button>
          </div>
        </div>
      </section>

      {/* ── What You Get ─────────────────────────────── */}
      <section id="what-you-get" className="bg-gray-50 py-20 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-page-dark text-center mb-16 tracking-tight scroll-reveal">
            Everything that changes once<br className="hidden sm:block" /> mortgage holds are gone
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="scroll-reveal bg-white rounded-[20px] p-8 shadow-card-soft border border-gray-100 hover:shadow-elevated transition-all duration-300 group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex gap-5">
                  <div className="w-1 h-10 rounded-full bg-gradient-to-b from-brand-gradient-start to-brand-gradient-end group-hover:h-14 transition-all duration-300 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-page-dark mb-2">{feature.title}</h3>
                    <p className="text-page-muted text-base leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ─────────────────────────────── */}
      <section className="bg-white py-20 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-semibold px-4 py-2 rounded-full mb-5 tracking-wide uppercase">
              <BadgeCheck className="w-3.5 h-3.5" />
              $62M+ processed through TPI
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-4 leading-tight">
              Trusted by contractors who got tired<br className="hidden sm:block" /> of waiting to get paid
            </h2>
            <p className="text-lg text-page-muted max-w-xl mx-auto">
              Real companies. Real revenue cashed without a single mortgage hold.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <div
                key={t.company}
                className="scroll-reveal bg-white rounded-[25px] p-7 sm:p-8 shadow-card-soft border border-gray-100 hover:shadow-elevated transition-shadow duration-300 flex flex-col"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Header — logo + company */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl ${t.logoBg} border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.logo}
                      alt={`${t.company} logo`}
                      className="w-full h-full object-contain p-1.5"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-black text-page-dark truncate">{t.company}</h3>
                      <BadgeCheck className="w-5 h-5 text-brand-gradient-end fill-brand-gradient-end/10 flex-shrink-0" aria-label="Verified" />
                    </div>
                    <div className="text-sm text-page-muted truncate">{t.location} · {t.website}</div>
                  </div>
                </div>

                {/* Stars + verified label */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-brand-gradient-end fill-brand-gradient-end" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
                    Verified TPI Customer
                  </span>
                </div>

                {/* Quote */}
                <p className="text-page-dark text-[15px] leading-relaxed mb-6 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Stat tiles */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-brand-gradient-start/5 to-brand-gradient-end/10 border border-brand-gradient-end/15 rounded-2xl px-4 py-3">
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end leading-none">
                      {t.revenue}
                    </div>
                    <div className="text-xs text-page-muted mt-1.5 font-medium">cashed through TPI</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                    <div className="text-2xl font-black text-page-dark leading-none">
                      {t.years}
                    </div>
                    <div className="text-xs text-page-muted mt-1.5 font-medium">using the system</div>
                  </div>
                </div>

                {/* Owner footer */}
                <div className="border-t border-gray-100 pt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-page-dark text-sm">{t.name}</div>
                    <div className="text-page-muted text-xs truncate">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section id="faq" className="bg-gray-50 py-20 md:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-page-dark text-center mb-16 tracking-tight scroll-reveal">
            Frequently asked questions
          </h2>

          <div className="space-y-3 scroll-reveal">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-page-dark pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <Minus className="w-5 h-5 text-page-muted flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-page-muted flex-shrink-0" />
                  )}
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{
                    gridTemplateRows: openFaq === i ? '1fr' : '0fr',
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5 text-page-muted text-base leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────── */}
      <section className="bg-page-dark py-20 md:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center scroll-reveal">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            Ready to stop losing weeks of cash flow to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
              mortgage holds?
            </span>
          </h2>
          <p className="text-gray-400 mb-10 text-lg max-w-xl mx-auto">
            One call. One week of setup. A lifetime of same-day deposits. No more chasing mortgage companies,
            no more certified mail, no more waiting to get paid for work you already finished.
          </p>
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            className="btn-gradient px-12 py-4 text-lg"
          >
            Book Your Call to Start
          </button>
          <p className="text-sm text-gray-500 mt-6">
            $3,000 one-time setup — no recurring fees, no per-check charges
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="bg-page-dark border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo height={56} variant="light" />
            <div className="flex items-center gap-8">
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#what-you-get" className="text-sm text-gray-400 hover:text-white transition-colors">
                What You Get
              </a>
              <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">
                FAQ
              </a>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">&copy; 2026 Crucible. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ── Booking Modal ────────────────────────────── */}
      {bookingOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-3 py-6 sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-label="Book a call with Crucible"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setBookingOpen(false)}
          />
          <div className="relative w-full max-w-3xl h-[90vh] bg-white rounded-[20px] shadow-elevated overflow-hidden flex flex-col">
            <button
              type="button"
              onClick={() => setBookingOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white shadow-card-soft flex items-center justify-center text-page-dark transition-colors"
              aria-label="Close booking"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={BOOKING_IFRAME_SRC}
              id={BOOKING_IFRAME_ID}
              title="Book a call with Crucible"
              className="w-full h-full border-0"
              scrolling="no"
            />
          </div>
        </div>
      )}

      <Script
        src="https://start.cruciblecoaching.org/js/form_embed.js"
        strategy="lazyOnload"
      />
    </div>
  )
}
