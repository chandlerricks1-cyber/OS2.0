'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'
import { useSystemTheme } from '@/hooks/useSystemTheme'
import { Mic, Video, Lightbulb, ShieldCheck, ChevronRight, ArrowRight, Sun, Moon, Trophy, Users, TrendingUp, Sparkles } from 'lucide-react'

const benefits = [
  {
    icon: Video,
    title: 'Get a Free Video Clip',
    description:
      'Walk away with a professionally produced short clip you can use across your social media accounts and for local SEO.',
  },
  {
    icon: Lightbulb,
    title: 'Gain Clarity on Your Model',
    description:
      'A structured conversation about your money model, acquisition strategy, and offers — so you can see exactly where to improve.',
  },
  {
    icon: ShieldCheck,
    title: 'Zero Pressure, All Value',
    description:
      'This is a real conversation about your business where you walk away with actionable insights.',
  },
]

const steps = [
  {
    step: '01',
    title: 'Book your episode',
    description:
      'Pick a date that works for you and share your contact info. We\'ll confirm the details.',
    image: '/images/podcast/step-01.svg',
  },
  {
    step: '02',
    title: 'Complete a short questionnaire',
    description:
      'Answer a few questions about your business so we can make the most of your episode — no guesswork on the call.',
    image: '/images/podcast/step-02.svg',
  },
  {
    step: '03',
    title: 'Show up and talk business',
    description:
      'Have a real conversation about what\'s working, what\'s not, and where the biggest opportunities are in your business.',
    image: '/images/podcast/step-03.svg',
  },
]

export default function PodcastPage() {
  const { isDark, toggle } = useSystemTheme()
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    preferred_date: '',
    _honey: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Re-reveal elements already in viewport (needed after theme toggle re-render)
    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight) {
        el.classList.add('revealed')
      }
    })
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
    document.querySelectorAll('.scroll-reveal:not(.revealed)').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [isDark])

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email address'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!form.preferred_date) newErrors.preferred_date = 'Please select a date'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/podcast/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.fields) setErrors(data.fields)
        else setErrors({ form: data.error || 'Something went wrong. Please try again.' })
        return
      }

      router.push(`/podcast/intake?lead=${data.id}`)
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Theme-aware classes
  const pageBg = isDark ? 'bg-page-dark' : 'bg-white'
  const heading = isDark ? 'text-white' : 'text-page-dark'
  const body = isDark ? 'text-gray-400' : 'text-gray-600'
  const muted = isDark ? 'text-gray-500' : 'text-gray-400'
  const navBg = isDark ? 'bg-page-dark/95 border-white/10' : 'bg-white/95 border-gray-200'
  const navLink = isDark ? 'text-gray-400 hover:text-white' : 'text-page-muted hover:text-page-dark'
  const card = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-card-soft'
  const cardHover = isDark ? 'hover:border-brand-gradient-end/30' : 'hover:shadow-elevated hover:border-brand-gradient-end/30'
  const input = isDark
    ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  const dateScheme = isDark ? '[color-scheme:dark]' : '[color-scheme:light]'
  const label = isDark ? 'text-gray-300' : 'text-gray-700'
  const footerBorder = isDark ? 'border-white/10' : 'border-gray-200'
  const imgPlaceholder = isDark ? 'bg-neutral-800' : 'bg-gray-100'

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>

      {/* ── Floating Nav ─────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className={`max-w-6xl mx-auto backdrop-blur-md rounded-2xl shadow-nav border px-6 py-3 flex items-center justify-between ${navBg}`}>
          <Logo height={68} variant={isDark ? 'light' : 'dark'} />
          <div className="hidden md:flex items-center gap-8">
            <a href="#benefits" className={`text-sm transition-colors ${navLink}`}>Benefits</a>
            <a href="#how-it-works" className={`text-sm transition-colors ${navLink}`}>How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a href="#book" className="btn-gradient text-sm px-5 py-2.5">Book Your Episode</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gradient-start/10 to-brand-gradient-end/10 border border-brand-gradient-end/20 text-brand-gradient-end text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide uppercase">
            <Mic className="w-3.5 h-3.5" />
            The Crucible Podcast
          </div>

          <h1 className={`text-4xl sm:text-5xl md:text-[56px] font-black leading-[1.08] tracking-tight mb-6 ${heading}`}>
            Solve your biggest growth constraint on{' '}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
              The Crucible Podcast
            </span>
          </h1>

          <p className={`text-lg max-w-2xl mx-auto mb-10 leading-relaxed ${body}`}>
            A zero-pressure conversation where we break down your business model,
            find your biggest constraint, and map out how to fix it — plus you
            walk away with a free video clip for your social media.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="#book" className="btn-gradient px-10 py-4 text-base">Book Your Episode</a>
            <a href="#how-it-works" className={`px-6 py-4 font-medium text-base transition-colors flex items-center gap-1 ${navLink}`}>
              How it works <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────── */}
      <section id="benefits" className="py-20 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight mb-4 ${heading}`}>
              What you get from your episode
            </h2>
            <p className={`text-lg max-w-xl mx-auto ${body}`}>
              This isn&apos;t a pitch — it&apos;s a conversation designed to give you real value
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((item, i) => (
              <div
                key={item.title}
                className={`scroll-reveal rounded-[25px] p-8 border transition-all duration-300 ${card} ${cardHover}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${heading}`}>{item.title}</h3>
                <p className={`text-base leading-relaxed ${body}`}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight mb-4 ${heading}`}>
              How it works
            </h2>
            <p className={`text-lg max-w-xl mx-auto ${body}`}>
              Three simple steps from signup to your episode
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <div
                key={item.step}
                className={`scroll-reveal rounded-[25px] border overflow-hidden ${card}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Image area */}
                <div className={`aspect-[16/10] relative overflow-hidden ${imgPlaceholder}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="absolute top-4 left-4 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-brand-gradient-start to-brand-gradient-end leading-none">
                    {item.step}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className={`text-xl font-bold mb-3 ${heading}`}>{item.title}</h3>
                  <p className={`text-base leading-relaxed ${body}`}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Meet Your Host ───────────────────────────── */}
      <section id="host" className="py-20 md:py-24 px-6">
        <div className="max-w-5xl mx-auto scroll-reveal">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gradient-start/10 to-brand-gradient-end/10 border border-brand-gradient-end/20 text-brand-gradient-end text-xs font-semibold px-4 py-2 rounded-full mb-6 tracking-wide uppercase">
              <Mic className="w-3.5 h-3.5" />
              Meet your host
            </div>
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight mb-4 ${heading}`}>
              Hosted by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
                Chandler Ricks
              </span>
            </h2>
          </div>

          <div className={`rounded-[30px] border p-8 md:p-12 grid md:grid-cols-[auto_1fr] gap-10 items-center ${card}`}>
            <div className="flex justify-center md:block">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end opacity-40 blur-xl" />
                <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden ring-4 ring-brand-gradient-end/40 shadow-[0_12px_40px_rgba(255,136,0,0.25)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/podcast/Square%20Headshot%20Italy%20copy.png"
                    alt="Chandler Ricks"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className={`text-2xl md:text-3xl font-black tracking-tight mb-2 ${heading}`}>
                Chandler Ricks
              </h3>
              <p className={`text-base mb-6 ${body}`}>
                Founder of Crucible Coaching — a conversation with Chandler is like an unfair advantage
                condensed into an hour.
              </p>

              <ul className="space-y-3">
                {[
                  { icon: Trophy, text: '8-Figure Business Owner' },
                  { icon: Users, text: 'Personally coached over 1,200 businesses' },
                  { icon: TrendingUp, text: 'Revenue Optimization Specialist' },
                  { icon: Sparkles, text: 'Customer Acquisition Wizard' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center shadow-[0_4px_14px_rgba(255,136,0,0.25)]">
                      <Icon className="w-4 h-4 text-white" />
                    </span>
                    <span className={`text-base font-semibold ${heading}`}>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lead Capture Form ────────────────────────── */}
      <section id="book" className="py-20 md:py-24 px-6">
        <div className="max-w-2xl mx-auto scroll-reveal">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight mb-4 ${heading}`}>
              Book your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
                episode
              </span>
            </h2>
            <p className={`text-lg ${body}`}>
              Fill out the form below and we&apos;ll get you on the schedule
            </p>
          </div>

          <form onSubmit={handleSubmit} className={`rounded-[25px] p-8 md:p-10 border ${card}`}>
            {/* Honeypot */}
            <input type="text" name="_honey" value={form._honey} onChange={(e) => setForm({ ...form, _honey: e.target.value })} className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="space-y-5">
              <div>
                <label htmlFor="full_name" className={`block text-sm font-semibold mb-2 ${label}`}>Full Name</label>
                <input
                  id="full_name"
                  type="text"
                  placeholder="John Smith"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className={`w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-gradient-end focus:border-brand-gradient-end outline-none transition-all border ${input}`}
                />
                {errors.full_name && <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${label}`}>Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-gradient-end focus:border-brand-gradient-end outline-none transition-all border ${input}`}
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className={`block text-sm font-semibold mb-2 ${label}`}>Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-gradient-end focus:border-brand-gradient-end outline-none transition-all border ${input}`}
                />
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="preferred_date" className={`block text-sm font-semibold mb-2 ${label}`}>Preferred Episode Date</label>
                <input
                  id="preferred_date"
                  type="date"
                  min={today}
                  value={form.preferred_date}
                  onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                  className={`w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-gradient-end focus:border-brand-gradient-end outline-none transition-all border ${input} ${dateScheme}`}
                />
                {errors.preferred_date && <p className="text-red-400 text-sm mt-1">{errors.preferred_date}</p>}
              </div>
            </div>

            {errors.form && (
              <p className="text-red-400 text-sm mt-4 text-center">{errors.form}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-gradient !flex w-full mt-8 h-14 items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : (
                <>
                  Continue to Questionnaire <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className={`text-sm text-center mt-4 ${muted}`}>
              Next step: a short questionnaire about your business so we can make the most of your episode.
            </p>
          </form>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className={`border-t py-12 px-6 ${footerBorder}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo height={56} variant={isDark ? 'light' : 'dark'} />
            <div className="flex items-center gap-8">
              <a href="#benefits" className={`text-sm transition-colors ${navLink}`}>Benefits</a>
              <a href="#how-it-works" className={`text-sm transition-colors ${navLink}`}>How It Works</a>
              <a href="#book" className={`text-sm transition-colors ${navLink}`}>Book Episode</a>
            </div>
          </div>
          <div className={`border-t mt-8 pt-8 text-center ${footerBorder}`}>
            <p className="text-sm text-gray-500">&copy; 2026 Crucible. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
