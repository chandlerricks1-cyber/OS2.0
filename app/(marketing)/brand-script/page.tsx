'use client'

import { useState, useEffect } from 'react'
import { Logo } from '@/components/shared/Logo'
import { useSystemTheme } from '@/hooks/useSystemTheme'
import { Sun, Moon, UserCircle2, AlertTriangle, Compass, ListChecks, Trophy, Sparkles, Copy, Check, User, RefreshCw } from 'lucide-react'

const sectionMeta = [
  { icon: User, title: 'About You', number: '00' },
  { icon: UserCircle2, title: 'The Hero (Your Customer)', number: '01' },
  { icon: AlertTriangle, title: 'The Problem', number: '02' },
  { icon: Compass, title: 'The Guide (Your Company)', number: '03' },
  { icon: ListChecks, title: 'The Plan', number: '04' },
  { icon: Trophy, title: 'The Win', number: '05' },
]

const initialForm = {
  full_name: '',
  email: '',
  phone: '',
  hero: '',
  external_problem: '',
  internal_problem: '',
  whats_at_stake: '',
  empathy: '',
  authority: '',
  plan_step_1: '',
  plan_step_2: '',
  plan_step_3: '',
  the_win: '',
  _honey: '',
}

export default function BrandScriptPage() {
  const { isDark, toggle } = useSystemTheme()

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<'form' | 'generating' | 'result'>('form')
  const [brandScript, setBrandScript] = useState<string | null>(null)
  const [aiError, setAiError] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
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
  }, [isDark, phase])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Required'
    if (!form.email.trim()) newErrors.email = 'Required'
    if (!form.phone.trim()) newErrors.phone = 'Required'
    if (!form.hero.trim()) newErrors.hero = 'Required'
    if (!form.external_problem.trim()) newErrors.external_problem = 'Required'
    if (!form.empathy.trim()) newErrors.empathy = 'Required'
    if (!form.the_win.trim()) newErrors.the_win = 'Required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstError = document.querySelector('[data-error="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setPhase('generating')
    try {
      const res = await fetch('/api/brand-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.fields) setErrors(data.fields)
        else setErrors({ form: data.error || 'Something went wrong. Please try again.' })
        setPhase('form')
        return
      }

      setBrandScript(data.brand_script)
      setAiError(data.ai_error || false)
      setPhase('result')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' })
      setPhase('form')
    }
  }

  async function handleCopy() {
    if (!brandScript) return
    await navigator.clipboard.writeText(brandScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleStartOver() {
    setForm(initialForm)
    setErrors({})
    setBrandScript(null)
    setAiError(false)
    setPhase('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageBg = isDark ? 'bg-page-dark' : 'bg-white'
  const heading = isDark ? 'text-white' : 'text-page-dark'
  const body = isDark ? 'text-gray-400' : 'text-gray-600'
  const muted = isDark ? 'text-gray-500' : 'text-gray-400'
  const card = isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
  const headerBorder = isDark ? 'border-white/10' : 'border-gray-200'
  const labelCls = isDark ? 'text-gray-300' : 'text-gray-700'
  const inputCls = isDark
    ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  const hintCls = isDark ? 'text-gray-500' : 'text-gray-400'

  const inputBase = `w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-gradient-end focus:border-brand-gradient-end outline-none transition-all border ${inputCls}`
  const textareaBase = `${inputBase} resize-y min-h-[80px]`
  const labelBase = `block text-sm font-semibold mb-2 ${labelCls}`

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
      {/* ── Header ───────────────────────────────────── */}
      <div className={`border-b px-6 py-4 ${headerBorder}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Logo height={56} variant={isDark ? 'light' : 'dark'} />
          <div className="flex items-center gap-3">
            <span className={`text-sm ${body}`}>Free Brand Script Generator</span>
            <button
              onClick={toggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Generating State ─────────────────────────── */}
      {phase === 'generating' && (
        <div className="max-w-3xl mx-auto px-6 py-32 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${heading}`}>Crafting your brand script...</h2>
          <p className={body}>We&apos;re turning your answers into a compelling story. This takes just a moment.</p>
        </div>
      )}

      {/* ── Result State ─────────────────────────────── */}
      {phase === 'result' && (
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
          <div className="text-center mb-10 scroll-reveal">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl md:text-4xl font-black tracking-tight mb-4 ${heading}`}>
              Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
                Brand Script
              </span>
            </h1>
            <p className={`text-lg max-w-xl mx-auto ${body}`}>
              Here&apos;s your 60-90 second brand moment. Practice it once or twice out loud — but don&apos;t memorize it. Just know the beats and let it flow naturally.
            </p>
          </div>

          {brandScript ? (
            <div className={`rounded-[25px] p-8 border relative ${isDark ? 'bg-white/5 border-brand-gradient-end/20' : 'bg-gradient-to-br from-orange-50 to-amber-50 border-brand-gradient-end/30'}`}>
              <p className={`text-lg leading-relaxed italic ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                &ldquo;{brandScript}&rdquo;
              </p>
              <button
                onClick={handleCopy}
                className={`absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-white/10 text-gray-400 hover:text-white' : 'bg-white text-gray-500 hover:text-gray-900 shadow-sm'}`}
                aria-label="Copy brand script"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className={`rounded-[25px] p-8 border text-center ${card}`}>
              <p className={body}>
                We saved your answers but couldn&apos;t generate the script right now. Please try again in a moment.
              </p>
              {aiError && (
                <p className={`text-sm mt-2 ${muted}`}>The AI generator hit a snag — your answers are safe.</p>
              )}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <button
              onClick={handleStartOver}
              className="btn-gradient !flex w-full h-14 items-center justify-center gap-2 text-base"
            >
              Start Over <RefreshCw className="w-4 h-4" />
            </button>
            <p className={`text-sm text-center ${muted}`}>
              Want help bringing this to life across your marketing? Reach out to Chandler.
            </p>
          </div>
        </div>
      )}

      {/* ── Form State ───────────────────────────────── */}
      {phase === 'form' && (
        <>
          {/* Intro */}
          <div className="max-w-3xl mx-auto px-6 pt-12 pb-8">
            <div className="text-center scroll-reveal">
              <h1 className={`text-3xl md:text-4xl font-black tracking-tight mb-4 ${heading}`}>
                Free{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
                  Brand Script
                </span>{' '}
                Generator
              </h1>
              <p className={`text-lg max-w-xl mx-auto mb-3 ${body}`}>
                Craft the 60-90 second story that makes potential customers think: &ldquo;That&apos;s who I want to call.&rdquo;
              </p>
              <p className={`max-w-xl mx-auto ${muted}`}>
                Answer a few short questions and we&apos;ll turn them into a brand script you can use on a podcast, a sales call, or your homepage. Your customer is the hero — your company is the guide that helps them win.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 pb-24">
            <input type="text" name="_honey" value={form._honey} onChange={(e) => update('_honey', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />

            {/* Section 0: About You */}
            <div className="scroll-reveal mb-10">
              <SectionHeader icon={sectionMeta[0].icon} title={sectionMeta[0].title} number={sectionMeta[0].number} headingClass={heading} />
              <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
                <p className={`text-sm ${hintCls}`}>So we know who&apos;s using the tool. We won&apos;t spam you.</p>
                <div>
                  <label htmlFor="full_name" className={labelBase}>Full Name *</label>
                  <input
                    id="full_name"
                    type="text"
                    placeholder="Jane Doe"
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    className={inputBase}
                    data-error={!!errors.full_name || undefined}
                    autoComplete="name"
                  />
                  {errors.full_name && <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className={labelBase}>Email *</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={inputBase}
                    data-error={!!errors.email || undefined}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className={labelBase}>Phone *</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className={inputBase}
                    data-error={!!errors.phone || undefined}
                    autoComplete="tel"
                  />
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Section 1: The Hero */}
            <div className="scroll-reveal mb-10">
              <SectionHeader icon={sectionMeta[1].icon} title={sectionMeta[1].title} number={sectionMeta[1].number} headingClass={heading} />
              <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
                <p className={`text-sm ${hintCls}`}>Who is your typical customer and what do they want?</p>
                <div>
                  <label htmlFor="hero" className={labelBase}>Who is your hero? *</label>
                  <textarea
                    id="hero"
                    placeholder='e.g. "A homeowner who just wants to feel safe and comfortable in their own home."'
                    value={form.hero}
                    onChange={(e) => update('hero', e.target.value)}
                    className={textareaBase}
                    rows={3}
                    data-error={!!errors.hero || undefined}
                  />
                  {errors.hero && <p className="text-red-400 text-sm mt-1">{errors.hero}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: The Problem */}
            <div className="scroll-reveal mb-10">
              <SectionHeader icon={sectionMeta[2].icon} title={sectionMeta[2].title} number={sectionMeta[2].number} headingClass={heading} />
              <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
                <p className={`text-sm ${hintCls}`}>Think about three layers of your customer&apos;s problem:</p>
                <div>
                  <label htmlFor="external_problem" className={labelBase}>External Problem — The surface-level issue *</label>
                  <textarea
                    id="external_problem"
                    placeholder='e.g. "I have ants in my kitchen" or "I found droppings in my garage."'
                    value={form.external_problem}
                    onChange={(e) => update('external_problem', e.target.value)}
                    className={textareaBase}
                    rows={2}
                    data-error={!!errors.external_problem || undefined}
                  />
                  {errors.external_problem && <p className="text-red-400 text-sm mt-1">{errors.external_problem}</p>}
                </div>
                <div>
                  <label htmlFor="internal_problem" className={labelBase}>Internal Problem — How it makes them FEEL</label>
                  <textarea
                    id="internal_problem"
                    placeholder={'e.g. "I feel embarrassed to have people over" or "I\'m worried about my kids\' health."'}
                    value={form.internal_problem}
                    onChange={(e) => update('internal_problem', e.target.value)}
                    className={textareaBase}
                    rows={2}
                  />
                </div>
                <div>
                  <label htmlFor="whats_at_stake" className={labelBase}>What&apos;s At Stake — What happens if they do nothing?</label>
                  <textarea
                    id="whats_at_stake"
                    placeholder='e.g. "The infestation gets worse, costs more, and their home feels out of control."'
                    value={form.whats_at_stake}
                    onChange={(e) => update('whats_at_stake', e.target.value)}
                    className={textareaBase}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: The Guide */}
            <div className="scroll-reveal mb-10">
              <SectionHeader icon={sectionMeta[3].icon} title={sectionMeta[3].title} number={sectionMeta[3].number} headingClass={heading} />
              <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
                <p className={`text-sm ${hintCls}`}>A great guide does two things: shows empathy (&ldquo;I understand&rdquo;) and demonstrates authority (&ldquo;I&apos;ve done this before&rdquo;).</p>
                <div>
                  <label htmlFor="empathy" className={labelBase}>Empathy — How do you show customers you understand? *</label>
                  <textarea
                    id="empathy"
                    placeholder='e.g. "We know how stressful it is — nobody wants to feel like a guest in their own home."'
                    value={form.empathy}
                    onChange={(e) => update('empathy', e.target.value)}
                    className={textareaBase}
                    rows={2}
                    data-error={!!errors.empathy || undefined}
                  />
                  {errors.empathy && <p className="text-red-400 text-sm mt-1">{errors.empathy}</p>}
                </div>
                <div>
                  <label htmlFor="authority" className={labelBase}>Authority — Why should they trust you?</label>
                  <textarea
                    id="authority"
                    placeholder={'e.g. "We\'ve treated over 5,000 homes in the valley" or "300+ five-star reviews."'}
                    value={form.authority}
                    onChange={(e) => update('authority', e.target.value)}
                    className={textareaBase}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: The Plan */}
            <div className="scroll-reveal mb-10">
              <SectionHeader icon={sectionMeta[4].icon} title={sectionMeta[4].title} number={sectionMeta[4].number} headingClass={heading} />
              <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
                <p className={`text-sm ${hintCls}`}>Give people 3 simple steps. This removes confusion and makes it easy to say yes.</p>
                <div>
                  <label htmlFor="plan_step_1" className={labelBase}>Step 1</label>
                  <input
                    id="plan_step_1"
                    type="text"
                    placeholder='e.g. "Call us or book online."'
                    value={form.plan_step_1}
                    onChange={(e) => update('plan_step_1', e.target.value)}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label htmlFor="plan_step_2" className={labelBase}>Step 2</label>
                  <input
                    id="plan_step_2"
                    type="text"
                    placeholder='e.g. "We inspect your home and build a custom plan."'
                    value={form.plan_step_2}
                    onChange={(e) => update('plan_step_2', e.target.value)}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label htmlFor="plan_step_3" className={labelBase}>Step 3</label>
                  <input
                    id="plan_step_3"
                    type="text"
                    placeholder='e.g. "We eliminate the problem and keep it gone."'
                    value={form.plan_step_3}
                    onChange={(e) => update('plan_step_3', e.target.value)}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            {/* Section 5: The Win */}
            <div className="scroll-reveal mb-10">
              <SectionHeader icon={sectionMeta[5].icon} title={sectionMeta[5].title} number={sectionMeta[5].number} headingClass={heading} />
              <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
                <p className={`text-sm ${hintCls}`}>Paint the picture: what does life look like AFTER they work with you?</p>
                <div>
                  <label htmlFor="the_win" className={labelBase}>The Happy Ending *</label>
                  <textarea
                    id="the_win"
                    placeholder='e.g. "They have a pest-free home, they feel comfortable again, and they never worry about it."'
                    value={form.the_win}
                    onChange={(e) => update('the_win', e.target.value)}
                    className={textareaBase}
                    rows={3}
                    data-error={!!errors.the_win || undefined}
                  />
                  {errors.the_win && <p className="text-red-400 text-sm mt-1">{errors.the_win}</p>}
                </div>
              </div>
            </div>

            {/* Submit */}
            {errors.form && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-4 mb-6 text-center">
                <p className="text-red-400 text-sm">{errors.form}</p>
              </div>
            )}
            <button type="submit" className="btn-gradient !flex w-full h-14 items-center justify-center gap-2 text-base">
              Generate My Brand Script <Sparkles className="w-4 h-4" />
            </button>
            <p className={`text-sm text-center mt-4 ${muted}`}>Fields marked with * are required. Everything else is optional but makes the script stronger.</p>
          </form>
        </>
      )}
    </div>
  )
}

function SectionHeader({ icon: Icon, title, number, headingClass }: { icon: React.ElementType; title: string; number: string; headingClass: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
          {number}
        </span>
        <h2 className={`text-xl font-bold ${headingClass}`}>{title}</h2>
      </div>
    </div>
  )
}
