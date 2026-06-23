'use client'

import { useEffect, useRef, useState } from 'react'
import { Logo } from '@/components/shared/Logo'
import { POV_EXAMPLES, type PovExampleStats } from '@/lib/pov-pro/povExamples'
import {
  Sparkles,
  Camera,
  TrendingUp,
  DollarSign,
  Glasses,
  Video,
  Crown,
  Zap,
  Users,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  Award,
  Wrench,
  Plus,
  Minus,
  VolumeX,
  Eye,
  MessageCircle,
  UserPlus,
} from 'lucide-react'

// Doors open ~3 weeks from launch prep (2026-06-22). Update if the date moves.
const LAUNCH_DATE = '2026-07-13T09:00:00'

const FOUNDING_SPOTS = 20
const BONUS_VALUE = '$400'

// ─────────────────────────────────────────────────────────────────────────────
// Countdown
// ─────────────────────────────────────────────────────────────────────────────
function useCountdown(target: string) {
  const [parts, setParts] = useState<{ d: number; h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    const targetMs = new Date(target).getTime()
    const tick = () => {
      const diff = Math.max(0, targetMs - Date.now())
      setParts({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  return parts
}

function Countdown() {
  const parts = useCountdown(LAUNCH_DATE)
  const cells = [
    { label: 'Days', value: parts?.d },
    { label: 'Hrs', value: parts?.h },
    { label: 'Min', value: parts?.m },
    { label: 'Sec', value: parts?.s },
  ]
  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3">
      {cells.map((c) => (
        <div
          key={c.label}
          className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3.5 py-2.5 sm:px-5 sm:py-3 min-w-[64px] sm:min-w-[78px] text-center"
        >
          <div className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none">
            {(c.value ?? 0).toString().padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-white/60 mt-1.5">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// POV example reels — same clips & engagement data as the other POV Pro pages.
// ─────────────────────────────────────────────────────────────────────────────
function PovExamplesReel() {
  // Lead with the clips that have confirmed engagement — this is social proof.
  const examples = POV_EXAMPLES.filter((e) => e.stats).slice(0, 3)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  // Force muted and play/pause on visibility so off-screen reels don't burn bandwidth.
  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[]
    videos.forEach((v) => {
      v.muted = true
    })
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target as HTMLVideoElement
          if (entry.isIntersecting) v.play().catch(() => {})
          else v.pause()
        })
      },
      { threshold: 0.25 }
    )
    videos.forEach((v) => observer.observe(v))
    return () => observer.disconnect()
  }, [])

  if (examples.length === 0) return null

  return (
    <section className="bg-white px-5 sm:px-6 pt-20 pb-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 scroll-reveal">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gradient-end mb-3">
            <VolumeX className="w-3.5 h-3.5" />
            Real examples · no sound needed
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-page-dark tracking-tight">
            This is the skill you&apos;ll learn to capture
          </h2>
          <p className="text-base md:text-lg text-page-muted max-w-xl mx-auto mt-3">
            Real jobs, filmed through a tech&apos;s eyes — no studio, no script. This is the raw footage
            that gets millions of views and turns into real local leads.
          </p>
        </div>

        <div className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible pb-2 -mx-5 px-5 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
          {examples.map((ex, i) => (
            <div
              key={ex.src}
              className="scroll-reveal snap-center shrink-0 w-[68vw] max-w-[260px] sm:w-[240px] md:w-auto"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="relative rounded-[24px] overflow-hidden border-[5px] border-page-dark bg-black shadow-elevated aspect-[9/16]">
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el
                  }}
                  src={ex.src}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="metadata"
                  aria-label={`${ex.label} — POV example reel`}
                />
                <span className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/55 backdrop-blur flex items-center justify-center">
                  <VolumeX className="w-3.5 h-3.5 text-white" />
                </span>
                {ex.stats ? <EngagementRail stats={ex.stats} /> : null}
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/55 backdrop-blur px-2.5 py-1 rounded-full">
                  {ex.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Native reel-style engagement chips. Leads is accented — it's the money metric. */
function EngagementRail({ stats }: { stats: PovExampleStats }) {
  return (
    <div className="absolute right-2.5 bottom-12 flex flex-col items-center gap-3.5">
      <ReelStat icon={<Eye className="w-4 h-4 text-white" />} value={stats.views} srLabel="views" />
      <ReelStat
        icon={<MessageCircle className="w-4 h-4 text-white" />}
        value={stats.comments}
        srLabel="comments"
      />
      <ReelStat
        icon={<UserPlus className="w-4 h-4 text-white" />}
        value={stats.leads}
        srLabel="local leads"
        accent
      />
    </div>
  )
}

function ReelStat({
  icon,
  value,
  srLabel,
  accent = false,
}: {
  icon: React.ReactNode
  value: string
  srLabel: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1" aria-label={`${value} ${srLabel}`}>
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
          accent
            ? 'bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end'
            : 'bg-black/55 backdrop-blur'
        }`}
      >
        {icon}
      </span>
      <span
        className="text-[11px] font-bold text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
        aria-hidden
      >
        {value}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating nav
// ─────────────────────────────────────────────────────────────────────────────
function FloatingNav({ onJoin }: { onJoin: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-card-soft' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
        <Logo height={34} variant="dark" />
        <button
          onClick={onJoin}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-brand-orange/20 hover:scale-[1.03] transition-transform"
        >
          Join the prelaunch
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Lead form
// ─────────────────────────────────────────────────────────────────────────────
function LeadForm({ id }: { id: string }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', role: '', company: '' })
  const [honey, setHoney] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: '' }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrors({})
    setMessage('')
    try {
      const res = await fetch('/api/pov-pro/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, _honey: honey }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.fields) setErrors(data.fields)
        setMessage(data.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setMessage('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div id={id} className="bg-white rounded-3xl shadow-card-soft border border-gray-100 p-8 sm:p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-black text-page-dark mb-3">You&apos;re on the founding list.</h3>
        <p className="text-page-muted leading-relaxed max-w-md mx-auto">
          Watch your phone and inbox — we&apos;ll reach out personally with your early-access details and how
          to lock in your founding spot before doors open. The first {FOUNDING_SPOTS} get the free gear.
        </p>
      </div>
    )
  }

  return (
    <form
      id={id}
      onSubmit={submit}
      className="bg-white rounded-3xl shadow-card-soft border border-gray-100 p-6 sm:p-8"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-page-dark mb-1.5">Full name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={set('full_name')}
            placeholder="Jordan Smith"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-page-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gradient-end/40 focus:border-brand-gradient-end"
          />
          {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-page-dark mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@email.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-page-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gradient-end/40 focus:border-brand-gradient-end"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-page-dark mb-1.5">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="(555) 123-4567"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-page-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gradient-end/40 focus:border-brand-gradient-end"
            />
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-page-dark mb-1.5">
              Your trade <span className="font-normal text-page-muted">(optional)</span>
            </label>
            <select
              value={form.role}
              onChange={set('role')}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-page-dark focus:outline-none focus:ring-2 focus:ring-brand-gradient-end/40 focus:border-brand-gradient-end bg-white"
            >
              <option value="">Select…</option>
              <option>Pest control tech</option>
              <option>HVAC</option>
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Roofing / restoration</option>
              <option>Landscaping / lawn</option>
              <option>Cleaning</option>
              <option>Other home service</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-page-dark mb-1.5">
              Company <span className="font-normal text-page-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={form.company}
              onChange={set('company')}
              placeholder="Where you work"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-page-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gradient-end/40 focus:border-brand-gradient-end"
            />
          </div>
        </div>

        {/* Honeypot — hidden from humans */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honey}
          onChange={(e) => setHoney(e.target.value)}
          className="absolute left-[-9999px] w-px h-px opacity-0"
          aria-hidden="true"
        />

        {status === 'error' && message && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{message}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white text-base font-bold px-8 py-4 rounded-xl shadow-lg shadow-brand-orange/20 hover:scale-[1.01] transition-transform disabled:opacity-60 disabled:hover:scale-100"
        >
          {status === 'submitting' ? 'Sending…' : 'Claim my founding spot'}
          {status !== 'submitting' && <ArrowRight className="w-5 h-5" />}
        </button>
        <p className="text-xs text-center text-page-muted flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          No spam. We&apos;ll only reach out about early access and your founding-member gear.
        </p>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export function PrelaunchLanding() {
  const formRef = useRef<HTMLDivElement>(null)
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // Scroll-reveal — reuses the .scroll-reveal / .revealed pattern from globals.css.
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
      <FloatingNav onJoin={scrollToForm} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-dark pt-28 pb-20 px-5 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, #ff8800 0%, rgba(255,136,0,0) 70%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-amber-light text-xs font-semibold px-4 py-2 rounded-full mb-7 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Prelaunch · Founding members only · Doors open soon
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[58px] font-black text-white tracking-tight leading-[1.04] mb-6">
            The one skill every tradesman{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-amber to-brand-gradient-end">
              will wish they learned first.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-9 leading-relaxed">
            POV Pro is the community for technicians and tradesmen who want to master capturing the
            work they already do — and turn that one skill into a bigger paycheck, more job security,
            and a name people in the trade actually know.
          </p>

          <div className="flex flex-col items-center gap-4 mb-12">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white text-base sm:text-lg font-bold px-9 py-4 rounded-full shadow-xl shadow-brand-orange/30 hover:scale-[1.03] transition-transform"
            >
              Get early access + free gear
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-white/55">
              Takes 30 seconds. First {FOUNDING_SPOTS} founding members get free gear worth {BONUS_VALUE}.
            </p>
          </div>

          {/* Countdown */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-white/50 mb-3">Prelaunch closes in</p>
            <Countdown />
          </div>
        </div>
      </section>

      {/* ── Founding bonus banner ─────────────────────────────────────────── */}
      <section className="px-5 sm:px-6 -mt-10 relative z-10">
        <div className="max-w-4xl mx-auto scroll-reveal">
          <div className="rounded-3xl bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end p-[2px] shadow-xl shadow-brand-orange/20">
            <div className="rounded-3xl bg-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-gradient-end mb-1.5">
                    <Zap className="w-3.5 h-3.5" /> Founding-member bonus
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-page-dark leading-snug">
                    First {FOUNDING_SPOTS} to join get a free pair of Meta glasses or a DJI Osmo Nano
                  </h2>
                  <p className="text-page-muted mt-1.5">
                    The exact gear you&apos;ll use to capture POV content — yours free, a {BONUS_VALUE} value.
                    When the {FOUNDING_SPOTS} spots are gone, they&apos;re gone.
                  </p>
                </div>
                <button
                  onClick={scrollToForm}
                  className="shrink-0 inline-flex items-center gap-2 bg-page-dark text-white text-sm font-bold px-6 py-3.5 rounded-full hover:bg-black transition-colors"
                >
                  Claim a spot
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── POV example reels ─────────────────────────────────────────────── */}
      <PovExamplesReel />

      {/* ── Why this matters now ──────────────────────────────────────────── */}
      <section className="px-5 sm:px-6 py-20">
        <div className="max-w-4xl mx-auto text-center scroll-reveal">
          <h2 className="text-3xl sm:text-4xl font-black text-page-dark tracking-tight mb-5">
            Your hands already do the work. Now get paid for showing it.
          </h2>
          <p className="text-lg text-page-muted max-w-2xl mx-auto leading-relaxed">
            Right now, the techs who can capture great job-site footage are the most valuable people on
            any crew — because their company can&apos;t grow without them. That skill is rare today, and
            the platforms are paying out attention for it. POV Pro teaches you to do it on the jobs you
            already run, so you become the person every owner wants to keep, promote, and pay more.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-5 mt-12">
          {[
            {
              Icon: TrendingUp,
              title: 'Become un-fireable',
              body: 'A tech who brings the company leads and a following is the last one let go and the first one promoted.',
            },
            {
              Icon: DollarSign,
              title: 'Turn the skill into income',
              body: 'Higher pay, bonuses, raises, side income — the people who can capture and grow an audience get paid for it.',
            },
            {
              Icon: Clock,
              title: 'Ride the wave early',
              body: "POV content is exploding and most trades haven't caught on yet. Learn it now while it's still wide open.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="scroll-reveal bg-white rounded-2xl p-6 shadow-card-soft border border-gray-100 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-gradient-start/15 to-brand-gradient-end/15 flex items-center justify-center mb-4">
                <c.Icon className="w-5 h-5 text-brand-gradient-end" />
              </div>
              <h3 className="font-bold text-page-dark mb-1.5">{c.title}</h3>
              <p className="text-sm text-page-muted leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What you'll learn ─────────────────────────────────────────────── */}
      <section className="px-5 sm:px-6 py-20 bg-brand-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-gradient-end mb-3">
              <Wrench className="w-3.5 h-3.5" /> The skill
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-page-dark tracking-tight mb-4">
              What you&apos;ll master inside POV Pro
            </h2>
            <p className="text-lg text-page-muted max-w-2xl mx-auto leading-relaxed">
              No experience needed. You don&apos;t have to be on camera or be a &quot;content person.&quot;
              You learn a repeatable skill on jobs you&apos;re already doing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                Icon: Camera,
                title: 'Capture footage that actually gets watched',
                body: 'How to film the reveal, the fix, and the before/after with POV glasses — in about a minute, hands-free, mid-job.',
              },
              {
                Icon: Video,
                title: 'Find the moments that stop the scroll',
                body: 'What to point the camera at and why some clips travel while others die — the instincts pros build over years, shortcut.',
              },
              {
                Icon: TrendingUp,
                title: 'Turn views into leads and income',
                body: 'How this content brings the company real local customers — and how to make sure you get paid for driving them.',
              },
              {
                Icon: Users,
                title: 'Build your name in the trade',
                body: 'A weekly community of techs leveling up together — feedback, accountability, and recognition for your best work.',
              },
            ].map((c) => (
              <div
                key={c.title}
                className="scroll-reveal bg-white rounded-2xl p-6 shadow-card-soft border border-gray-100 flex gap-4"
              >
                <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center">
                  <c.Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-page-dark mb-1.5">{c.title}</h3>
                  <p className="text-sm text-page-muted leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How the prelaunch works ───────────────────────────────────────── */}
      <section className="px-5 sm:px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl font-black text-page-dark tracking-tight mb-4">
              How the prelaunch works
            </h2>
            <p className="text-lg text-page-muted max-w-xl mx-auto">
              Three steps to lock in early access and your founding-member gear.
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                step: '01',
                title: 'Drop your info',
                body: 'Tell us who you are and what you do. Takes 30 seconds — that puts you on the founding-member list.',
              },
              {
                step: '02',
                title: 'Get early access',
                body: 'We reach out personally with how to join before the public, what the community includes, and your founding pricing.',
              },
              {
                step: '03',
                title: 'Claim your spot + free gear',
                body: `Lock in your founding membership. The first ${FOUNDING_SPOTS} to join get a free pair of Meta glasses or a DJI Osmo Nano (${BONUS_VALUE} value).`,
              },
            ].map((s) => (
              <div
                key={s.step}
                className="scroll-reveal flex gap-5 items-start bg-white rounded-2xl p-6 shadow-card-soft border border-gray-100"
              >
                <div className="shrink-0 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-page-dark mb-1">{s.title}</h3>
                  <p className="text-page-muted leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ──────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-6 py-16 bg-brand-cream">
        <div className="max-w-3xl mx-auto text-center scroll-reveal">
          <Award className="w-8 h-8 text-brand-gradient-end mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-black text-page-dark tracking-tight mb-6">
            This is for you if…
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-left">
            {[
              "You're a technician or tradesman in the field every day",
              'You want to earn more without leaving the trade you know',
              "You'd rather learn a skill than wait for a raise",
              "You're curious about content but don't know where to start",
              'You want to be the most valuable person on your crew',
              'You want in before everyone else figures this out',
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 bg-white rounded-xl px-4 py-3.5 border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-brand-gradient-end shrink-0 mt-0.5" />
                <span className="text-page-dark text-sm leading-snug">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form / Final CTA ──────────────────────────────────────────────── */}
      <section ref={formRef} className="px-5 sm:px-6 py-20 scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 scroll-reveal">
            <div className="inline-flex items-center gap-2 bg-brand-gradient-end/10 text-brand-gradient-end text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-wide">
              <Glasses className="w-3.5 h-3.5" />
              {FOUNDING_SPOTS} founding spots · {BONUS_VALUE} in free gear
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-page-dark tracking-tight mb-4">
              Get on the founding list
            </h2>
            <p className="text-lg text-page-muted leading-relaxed">
              Send your info to get early access before doors open. The first {FOUNDING_SPOTS} who join
              get a free pair of Meta glasses or a DJI Osmo Nano — a {BONUS_VALUE} value.
            </p>
          </div>
          <div className="scroll-reveal">
            <LeadForm id="prelaunch-form" />
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <FaqSection />

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-brand-dark px-5 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo height={30} variant="light" />
          <p className="text-sm text-white/50">
            Capture the work → grow your name → get paid for the skill.
          </p>
          <p className="text-xs text-white/40">© 2026 Crucible Coaching</p>
        </div>
      </footer>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Do I need to be on camera?',
    a: 'No. The camera points at the work, not at you — the footage is your hands, the reveal, and the fix. No talking-head required, no being a "content person."',
  },
  {
    q: 'Do I need any experience with content or filming?',
    a: 'None. POV Pro is built to teach a tradesman with zero content experience how to capture footage that gets watched. You learn on the jobs you already run.',
  },
  {
    q: 'What is the free gear, exactly?',
    a: `The first ${FOUNDING_SPOTS} founding members choose a free pair of Meta (camera) glasses or a DJI Osmo Nano — a ${BONUS_VALUE} value. It's the exact gear you'll use to capture POV content, on us.`,
  },
  {
    q: 'When does it launch?',
    a: 'Doors open in about three weeks. Joining the prelaunch now is how you get early access, founding pricing, and a shot at the free gear before the public.',
  },
  {
    q: 'How much time does this take?',
    a: 'Capturing footage takes about a minute per job — on jobs you\'re already doing. The learning happens inside a community on your own schedule.',
  },
  {
    q: 'What does it cost to join?',
    a: 'Founding members get special pricing we share when we reach out. Getting on the prelaunch list is free and carries no obligation.',
  },
]

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="px-5 sm:px-6 py-20 bg-brand-cream">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-page-dark tracking-tight text-center mb-10 scroll-reveal">
          Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div
                key={f.q}
                className="scroll-reveal bg-white rounded-2xl border border-gray-100 shadow-card-soft overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-bold text-page-dark">{f.q}</span>
                  {isOpen ? (
                    <Minus className="w-5 h-5 text-brand-gradient-end shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-page-muted shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 -mt-1">
                    <p className="text-page-muted leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
