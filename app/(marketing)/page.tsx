'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { Play, Star, Plus, Minus, ChevronRight } from 'lucide-react'

const stats = [
  { value: '< 5 min', label: 'To complete intake' },
  { value: '7', label: 'Metrics analyzed' },
  { value: '3x', label: 'Avg LTV:CAC improvement' },
]

const steps = [
  {
    step: '01',
    title: 'Answer 7 questions',
    description:
      'Our AI has a natural conversation to collect your key metrics. Takes about 5 minutes. No spreadsheets, no forms.',
  },
  {
    step: '02',
    title: 'See your analysis',
    description:
      'Instantly see your CAC payback period, LTV:CAC ratio, and where you stand vs. healthy benchmarks.',
  },
  {
    step: '03',
    title: 'Get your roadmap',
    description:
      'Receive a detailed 90-day action plan with 3 high-impact opportunities specific to your numbers.',
  },
]

const features = [
  {
    title: 'Know Your Real CAC',
    description: 'Stop guessing. Our AI extracts your true customer acquisition cost from a 5-minute conversation.',
  },
  {
    title: 'See Your Payback Period',
    description: 'Find out exactly how many months it takes to recoup what you spend to acquire a customer.',
  },
  {
    title: 'Get Your Growth Roadmap',
    description: 'Receive a personalized 90-day action plan to reduce your CAC and accelerate payback.',
  },
  {
    title: 'Track Progress Over Time',
    description: 'Dashboard with all your key unit economics in one place, updated as your business grows.',
  },
]

const testimonials = [
  {
    quote: 'Crucible showed us our payback period was 14 months — we had no idea. Within 90 days we cut it to 6.',
    name: 'Sarah M.',
    title: 'DTC Brand Founder',
  },
  {
    quote: 'The analysis took 5 minutes but saved us months of guessing. Our LTV:CAC ratio improved 2.8x.',
    name: 'James K.',
    title: 'SaaS CEO',
  },
  {
    quote: 'Finally a tool that makes unit economics simple. The roadmap was specific, actionable, and it worked.',
    name: 'Priya R.',
    title: 'E-commerce Director',
  },
]

const faqs = [
  {
    q: 'What exactly does Crucible analyze?',
    a: 'Crucible looks at your customer acquisition cost (CAC), lifetime value (LTV), payback period, gross margins, and channel-level spend to give you a complete picture of your unit economics and where to improve.',
  },
  {
    q: 'How long does the intake analysis take?',
    a: 'About 5 minutes. Our AI asks you 7 focused questions in a conversational format — no spreadsheets or complex forms required.',
  },
  {
    q: 'Is the analysis really free?',
    a: 'Yes, completely free. No credit card required, no commitment. You get your full CAC analysis and initial recommendations at no cost.',
  },
  {
    q: 'What kind of businesses is this for?',
    a: 'Any business that spends money to acquire customers — SaaS, e-commerce, DTC brands, agencies, service businesses. If you have a CAC, Crucible can help you optimize it.',
  },
  {
    q: 'How is this different from doing it in a spreadsheet?',
    a: 'Crucible uses AI to extract insights you\'d miss manually, benchmarks your numbers against industry standards, and generates a specific action plan — not just numbers in cells.',
  },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
          <Logo height={36} />
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-page-muted hover:text-page-dark transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-sm text-page-muted hover:text-page-dark transition-colors">
              Features
            </a>
            <a href="#faq" className="text-sm text-page-muted hover:text-page-dark transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-page-muted hover:text-page-dark transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="btn-gradient text-sm px-5 py-2.5"
            >
              Get Free Analysis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gradient-start/10 to-brand-gradient-end/10 border border-brand-gradient-end/20 text-brand-gradient-end text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-brand-gradient-end rounded-full" />
            AI-Powered CAC Analysis
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[56px] font-black text-page-dark leading-[1.08] tracking-tight mb-6">
            Stop bleeding cash on customer
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
              acquisition that doesn&apos;t pay back
            </span>
          </h1>

          <p className="text-lg text-page-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Crucible analyzes your unit economics in minutes and gives you a clear,
            actionable plan to reduce your CAC payback period — so every dollar you
            spend on growth works harder.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="btn-gradient px-10 py-4 text-base"
            >
              Get My Free Analysis
            </Link>
            <a
              href="#how-it-works"
              className="text-page-muted hover:text-page-dark px-6 py-4 font-medium text-base transition-colors flex items-center gap-1"
            >
              How it works <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Video Placeholder */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-[25px] shadow-elevated overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-brand-gradient-end fill-brand-gradient-end ml-1" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 text-left">
                <div className="text-xs text-page-muted bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  See how Crucible works in 2 minutes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-6">
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
      <section id="how-it-works" className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-black text-page-dark tracking-tight mb-4">
              How Crucible works
            </h2>
            <p className="text-lg text-page-muted max-w-xl mx-auto">
              Three steps from signup to your personalized growth roadmap
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

      {/* ── Features ─────────────────────────────────── */}
      <section id="features" className="bg-gray-50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-page-dark text-center mb-16 tracking-tight scroll-reveal">
            Everything you need to understand<br className="hidden sm:block" /> your unit economics
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
      <section className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-page-dark text-center mb-16 tracking-tight scroll-reveal">
            Trusted by growth-focused founders
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
      <section id="faq" className="bg-gray-50 py-24 px-6">
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
      <section className="bg-page-dark py-24 px-6">
        <div className="max-w-3xl mx-auto text-center scroll-reveal">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            Ready to fix your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
              CAC payback period?
            </span>
          </h2>
          <p className="text-gray-400 mb-10 text-lg max-w-xl mx-auto">
            The intake analysis is completely free. No credit card, no commitment.
            See your numbers in under 5 minutes.
          </p>
          <Link
            href="/signup"
            className="btn-gradient px-12 py-4 text-lg"
          >
            Get My Free Analysis
          </Link>
          <p className="text-sm text-gray-500 mt-6">
            Free forever — no credit card required
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="bg-page-dark border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo height={30} />
            <div className="flex items-center gap-8">
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">
                FAQ
              </a>
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">&copy; 2026 Crucible. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
