'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { Logo } from '@/components/shared/Logo'
import { Star, Plus, Minus, ChevronRight, X } from 'lucide-react'

const BOOKING_IFRAME_SRC = 'https://start.cruciblecoaching.org/widget/booking/n6ep2x22ahM8EnsfIsKk'
const BOOKING_IFRAME_ID = 'n6ep2x22ahM8EnsfIsKk_1778162284873'

const rotatingPhrases = [
  'Stop waiting on mortgage companies',
  'Cash insurance checks the same day',
  'Eliminate mortgage holds forever',
]

const stats = [
  { value: '~1 week', label: 'Setup time from start to finish' },
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
    quote:
      "We had $180K sitting in mortgage holds at one point. Now every check gets deposited the day we get it. I wish I'd known about this three years ago.",
    name: 'Mike R.',
    title: 'Roofing Company Owner',
  },
  {
    quote:
      "The setup took about a week and I haven't thought about mortgage holds since. That alone is worth 10x what I paid.",
    name: 'Derek S.',
    title: 'Restoration Contractor',
  },
  {
    quote:
      "I used to have a full-time person chasing mortgage companies for endorsements. Now that role doesn't exist. The savings are insane.",
    name: 'Jessica T.',
    title: 'Roofing & Restoration CEO',
  },
]

const faqs = [
  {
    q: 'Is this actually legal?',
    a: 'Yes. Third-party indemnification is a standard banking instrument. The bank executes an agreement with your company that allows them to process multi-party checks on your behalf. Since you hold a valid Assignment of Benefits or Direction to Pay from the homeowner, you have a lawful right to the funds. The indemnification agreement simply releases the bank from liability — the same way the bank protects itself in any commercial deposit scenario. This has been used by contractors for years.',
  },
  {
    q: 'What kind of checks can I deposit without endorsement?',
    a: "Any multi-party insurance proceeds check where your company has a valid contractual right to the funds — including checks that name the mortgage company as an additionally insured party. You won't need the mortgage company's endorsement or the homeowner's endorsement once the arrangement is in place.",
  },
  {
    q: 'How long does the setup take?',
    a: "About one week from the time you provide all required documentation to our banking partner. We'll tell you exactly what's needed upfront so there's no guesswork or delays on your end.",
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
            Crucible sets up a third-party indemnification arrangement with a banking partner so you can
            deposit multi-party insurance checks — without chasing mortgage company endorsements, mailing
            certified letters, or waiting weeks to get paid for work you already completed.
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
          <h2 className="text-3xl md:text-4xl font-black text-page-dark text-center mb-16 tracking-tight scroll-reveal">
            Trusted by contractors who got tired<br className="hidden sm:block" /> of waiting to get paid
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="scroll-reveal bg-white rounded-[25px] p-8 shadow-card-soft border border-gray-100"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-brand-gradient-end fill-brand-gradient-end" />
                  ))}
                </div>
                <p className="text-page-dark text-base leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-gray-100 pt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-page-dark text-sm">{t.name}</div>
                    <div className="text-page-muted text-xs">{t.title}</div>
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
