import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

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

const stats = [
  { value: '< 5 min', label: 'to complete intake' },
  { value: '7', label: 'metrics analyzed' },
  { value: '3x', label: 'avg LTV:CAC improvement' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Hero (dark) ─────────────────────────────── */}
      <div className="bg-brand-dark">

        {/* Nav */}
        <nav className="border-b border-white/10 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Logo iconSize={26} textColor="text-white" textSize="lg" />
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-brand-orange hover:bg-brand-orange-dark text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Free Analysis
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 border border-brand-amber/30 bg-brand-amber/10 text-brand-amber text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-brand-amber rounded-full"></span>
            Free intake analysis — no credit card required
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
            Stop bleeding cash on customer
            <br />
            <span className="text-brand-orange">acquisition that doesn&apos;t pay back</span>
          </h1>

          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Crucible analyzes your unit economics in minutes and gives you a clear,
            actionable plan to reduce your CAC payback period — so every dollar you
            spend on growth works harder.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="bg-brand-orange hover:bg-brand-orange-dark text-white px-8 py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg shadow-brand-orange/20"
            >
              Get My Free Analysis
            </Link>
            <Link
              href="#how-it-works"
              className="text-white/60 hover:text-white px-6 py-3.5 rounded-xl font-medium text-base transition-colors"
            >
              How it works →
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 md:gap-20 mt-16 pt-16 border-t border-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-brand-amber">{stat.value}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── How it works (cream) ─────────────────────── */}
      <section id="how-it-works" className="bg-brand-cream py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-brand-dark text-center mb-3 tracking-tight">
            How Crucible works
          </h2>
          <p className="text-brand-dark/50 text-center mb-14 max-w-xl mx-auto">
            Three steps from signup to your personalized growth roadmap
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
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
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-7 border border-brand-cream-100 shadow-sm"
              >
                <div className="text-5xl font-black text-brand-orange/20 mb-4 leading-none">
                  {item.step}
                </div>
                <h3 className="font-bold text-brand-dark mb-2 text-lg">{item.title}</h3>
                <p className="text-brand-dark/50 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (white) ─────────────────────────── */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-brand-dark text-center mb-14 tracking-tight">
            Everything you need to understand your unit economics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border border-gray-100 rounded-2xl p-6 hover:border-brand-orange/30 hover:shadow-sm transition-all group"
              >
                <div className="w-1 h-6 bg-brand-orange rounded-full mb-4 group-hover:h-8 transition-all" />
                <h3 className="font-bold text-brand-dark mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + Footer (dark) ──────────────────────── */}
      <div className="bg-brand-dark">
        <section className="py-24">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight leading-tight">
              Ready to fix your<br />
              <span className="text-brand-amber">CAC payback period?</span>
            </h2>
            <p className="text-white/50 mb-10 text-lg">
              The intake analysis is completely free. No credit card, no commitment.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-brand-orange hover:bg-brand-orange-dark text-white px-10 py-4 rounded-xl font-bold text-base transition-colors shadow-lg shadow-brand-orange/20"
            >
              Get My Free Analysis
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Logo iconSize={22} textColor="text-white/80" textSize="base" />
            <p className="text-sm text-white/30">© 2026 Crucible. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
