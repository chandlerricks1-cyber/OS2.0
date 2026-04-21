'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'
import { useSystemTheme } from '@/hooks/useSystemTheme'
import { ArrowRight, Building2, DollarSign, Users, Target, TrendingUp, Sun, Moon } from 'lucide-react'

const sectionMeta = [
  { icon: Building2, title: 'Business Overview', number: '01' },
  { icon: DollarSign, title: 'Revenue & Money Model', number: '02' },
  { icon: Users, title: 'Customer Acquisition', number: '03' },
  { icon: Target, title: 'Offers & Positioning', number: '04' },
  { icon: TrendingUp, title: 'Constraints & Goals', number: '05' },
]

export default function PodcastIntakePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-page-dark flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <PodcastIntakeContent />
    </Suspense>
  )
}

function PodcastIntakeContent() {
  const { isDark, toggle } = useSystemTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = searchParams.get('lead')

  const [form, setForm] = useState({
    business_name: '',
    business_type: '',
    industry: '',
    years_in_business: '',
    business_description: '',
    monthly_revenue: '',
    revenue_model: '',
    average_transaction_value: '',
    customer_count: '',
    pricing_structure: '',
    primary_acquisition_channels: '',
    monthly_ad_spend: '',
    estimated_cac: '',
    close_rate: '',
    sales_process: '',
    primary_offer: '',
    secondary_offers: '',
    differentiator: '',
    biggest_constraint: '',
    tried_and_failed: '',
    goal_next_90_days: '',
    anything_else: '',
    _honey: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

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
  }, [isDark])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!form.business_name.trim()) newErrors.business_name = 'Required'
    if (!form.business_description.trim()) newErrors.business_description = 'Required'
    if (!form.primary_offer.trim()) newErrors.primary_offer = 'Required'
    if (!form.biggest_constraint.trim()) newErrors.biggest_constraint = 'Required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstError = document.querySelector('[data-error="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/podcast/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, ...form }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.fields) setErrors(data.fields)
        else setErrors({ form: data.error || 'Something went wrong. Please try again.' })
        return
      }

      router.push(`/podcast/guest-prep?lead=${leadId}`)
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Theme classes
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
  const selectCls = isDark
    ? 'bg-neutral-800 border-neutral-700 text-white [color-scheme:dark]'
    : 'bg-white border-gray-300 text-gray-900 [color-scheme:light]'

  const inputBase = `w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-gradient-end focus:border-brand-gradient-end outline-none transition-all border ${inputCls}`
  const textareaBase = `${inputBase} resize-y min-h-[80px]`
  const selectBase = `w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-gradient-end focus:border-brand-gradient-end outline-none transition-all border ${selectCls}`
  const labelBase = `block text-sm font-semibold mb-2 ${labelCls}`

  if (!leadId) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 ${pageBg}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${heading}`}>Start from the beginning</h1>
          <p className={`mb-6 ${body}`}>Please book your episode first before completing the questionnaire.</p>
          <a href="/podcast" className="btn-gradient px-8 py-3 inline-block">Book Your Episode</a>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
      {/* ── Header ───────────────────────────────────── */}
      <div className={`border-b px-6 py-4 ${headerBorder}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Logo height={56} variant={isDark ? 'light' : 'dark'} />
          <div className="flex items-center gap-3">
            <span className={`text-sm ${body}`}>Episode Questionnaire</span>
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

      {/* ── Intro ────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-8">
        <div className="text-center scroll-reveal">
          <h1 className={`text-3xl md:text-4xl font-black tracking-tight mb-4 ${heading}`}>
            Tell us about{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
              your business
            </span>
          </h1>
          <p className={`text-lg max-w-xl mx-auto ${body}`}>
            These answers help Chandler prepare for your episode so you get the most value
            out of the conversation. Answer what you can — estimates are fine.
          </p>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 pb-24">
        <input type="text" name="_honey" value={form._honey} onChange={(e) => update('_honey', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />

        {/* Section 1: Business Overview */}
        <div className="scroll-reveal mb-10">
          <SectionHeader icon={sectionMeta[0].icon} title={sectionMeta[0].title} number={sectionMeta[0].number} headingClass={heading} />
          <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
            <div>
              <label htmlFor="business_name" className={labelBase}>Business Name *</label>
              <input id="business_name" type="text" placeholder="Acme Corp" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} className={inputBase} data-error={!!errors.business_name || undefined} />
              {errors.business_name && <p className="text-red-400 text-sm mt-1">{errors.business_name}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="business_type" className={labelBase}>Business Type</label>
                <select id="business_type" value={form.business_type} onChange={(e) => update('business_type', e.target.value)} className={selectBase}>
                  <option value="">Select type...</option>
                  <option value="SaaS">SaaS</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Agency">Agency</option>
                  <option value="Service Business">Service Business</option>
                  <option value="Local Business">Local Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="industry" className={labelBase}>Industry</label>
                <input id="industry" type="text" placeholder="e.g. Marketing, Healthcare, Tech" value={form.industry} onChange={(e) => update('industry', e.target.value)} className={inputBase} />
              </div>
            </div>
            <div>
              <label htmlFor="years_in_business" className={labelBase}>Years in Business</label>
              <select id="years_in_business" value={form.years_in_business} onChange={(e) => update('years_in_business', e.target.value)} className={selectBase}>
                <option value="">Select...</option>
                <option value="Less than 1">Less than 1 year</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            <div>
              <label htmlFor="business_description" className={labelBase}>What does your business do? (1-2 sentences) *</label>
              <textarea id="business_description" placeholder="We help [who] achieve [what] by [how]..." value={form.business_description} onChange={(e) => update('business_description', e.target.value)} className={textareaBase} rows={3} data-error={!!errors.business_description || undefined} />
              {errors.business_description && <p className="text-red-400 text-sm mt-1">{errors.business_description}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Revenue & Money Model */}
        <div className="scroll-reveal mb-10">
          <SectionHeader icon={sectionMeta[1].icon} title={sectionMeta[1].title} number={sectionMeta[1].number} headingClass={heading} />
          <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="monthly_revenue" className={labelBase}>Monthly Revenue</label>
                <select id="monthly_revenue" value={form.monthly_revenue} onChange={(e) => update('monthly_revenue', e.target.value)} className={selectBase}>
                  <option value="">Select range...</option>
                  <option value="Under $10k">Under $10k</option>
                  <option value="$10k-$25k">$10k - $25k</option>
                  <option value="$25k-$50k">$25k - $50k</option>
                  <option value="$50k-$100k">$50k - $100k</option>
                  <option value="$100k-$250k">$100k - $250k</option>
                  <option value="$250k-$500k">$250k - $500k</option>
                  <option value="$500k+">$500k+</option>
                </select>
              </div>
              <div>
                <label htmlFor="revenue_model" className={labelBase}>Revenue Model</label>
                <select id="revenue_model" value={form.revenue_model} onChange={(e) => update('revenue_model', e.target.value)} className={selectBase}>
                  <option value="">Select model...</option>
                  <option value="Recurring / Subscription">Recurring / Subscription</option>
                  <option value="One-time purchases">One-time purchases</option>
                  <option value="Project-based">Project-based</option>
                  <option value="Hybrid / Mixed">Hybrid / Mixed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="average_transaction_value" className={labelBase}>Average Transaction Value</label>
                <input id="average_transaction_value" type="text" placeholder="e.g. $500, $2,000/mo" value={form.average_transaction_value} onChange={(e) => update('average_transaction_value', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label htmlFor="customer_count" className={labelBase}>Approximate Customer Count</label>
                <input id="customer_count" type="text" placeholder="e.g. 50, 200, 1000+" value={form.customer_count} onChange={(e) => update('customer_count', e.target.value)} className={inputBase} />
              </div>
            </div>
            <div>
              <label htmlFor="pricing_structure" className={labelBase}>Describe your main pricing or packages</label>
              <textarea id="pricing_structure" placeholder="e.g. We have 3 tiers: Starter at $49/mo, Pro at $149/mo, Enterprise custom pricing..." value={form.pricing_structure} onChange={(e) => update('pricing_structure', e.target.value)} className={textareaBase} rows={3} />
            </div>
          </div>
        </div>

        {/* Section 3: Customer Acquisition */}
        <div className="scroll-reveal mb-10">
          <SectionHeader icon={sectionMeta[2].icon} title={sectionMeta[2].title} number={sectionMeta[2].number} headingClass={heading} />
          <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
            <div>
              <label htmlFor="primary_acquisition_channels" className={labelBase}>Where do most of your customers come from?</label>
              <textarea id="primary_acquisition_channels" placeholder="e.g. Referrals, Google Ads, SEO, cold outreach, social media, partnerships..." value={form.primary_acquisition_channels} onChange={(e) => update('primary_acquisition_channels', e.target.value)} className={textareaBase} rows={2} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label htmlFor="monthly_ad_spend" className={labelBase}>Monthly Ad/Marketing Spend</label>
                <input id="monthly_ad_spend" type="text" placeholder="e.g. $2,000" value={form.monthly_ad_spend} onChange={(e) => update('monthly_ad_spend', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label htmlFor="estimated_cac" className={labelBase}>Estimated Cost per Customer</label>
                <input id="estimated_cac" type="text" placeholder="e.g. $150" value={form.estimated_cac} onChange={(e) => update('estimated_cac', e.target.value)} className={inputBase} />
              </div>
              <div>
                <label htmlFor="close_rate" className={labelBase}>Close Rate</label>
                <input id="close_rate" type="text" placeholder="e.g. 20%, not sure" value={form.close_rate} onChange={(e) => update('close_rate', e.target.value)} className={inputBase} />
              </div>
            </div>
            <div>
              <label htmlFor="sales_process" className={labelBase}>Walk me through how a lead becomes a paying customer</label>
              <textarea id="sales_process" placeholder="e.g. They find us on Google → book a call → we do a demo → they sign up..." value={form.sales_process} onChange={(e) => update('sales_process', e.target.value)} className={textareaBase} rows={3} />
            </div>
          </div>
        </div>

        {/* Section 4: Offers & Positioning */}
        <div className="scroll-reveal mb-10">
          <SectionHeader icon={sectionMeta[3].icon} title={sectionMeta[3].title} number={sectionMeta[3].number} headingClass={heading} />
          <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
            <div>
              <label htmlFor="primary_offer" className={labelBase}>What is the main thing you sell? *</label>
              <textarea id="primary_offer" placeholder="Describe your core offer — what the customer gets, how it's delivered, and the outcome..." value={form.primary_offer} onChange={(e) => update('primary_offer', e.target.value)} className={textareaBase} rows={3} data-error={!!errors.primary_offer || undefined} />
              {errors.primary_offer && <p className="text-red-400 text-sm mt-1">{errors.primary_offer}</p>}
            </div>
            <div>
              <label htmlFor="secondary_offers" className={labelBase}>Any upsells, add-ons, or backend offers?</label>
              <textarea id="secondary_offers" placeholder="e.g. Premium support package, group coaching, done-for-you service..." value={form.secondary_offers} onChange={(e) => update('secondary_offers', e.target.value)} className={textareaBase} rows={2} />
            </div>
            <div>
              <label htmlFor="differentiator" className={labelBase}>What makes you different from competitors?</label>
              <textarea id="differentiator" placeholder="What's your unfair advantage? Why do customers choose you over alternatives?" value={form.differentiator} onChange={(e) => update('differentiator', e.target.value)} className={textareaBase} rows={2} />
            </div>
          </div>
        </div>

        {/* Section 5: Constraints & Goals */}
        <div className="scroll-reveal mb-10">
          <SectionHeader icon={sectionMeta[4].icon} title={sectionMeta[4].title} number={sectionMeta[4].number} headingClass={heading} />
          <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
            <div>
              <label htmlFor="biggest_constraint" className={labelBase}>What&apos;s the #1 thing limiting your growth right now? *</label>
              <textarea id="biggest_constraint" placeholder="Be specific — is it leads, conversion, fulfillment, cash flow, team, time?" value={form.biggest_constraint} onChange={(e) => update('biggest_constraint', e.target.value)} className={textareaBase} rows={3} data-error={!!errors.biggest_constraint || undefined} />
              {errors.biggest_constraint && <p className="text-red-400 text-sm mt-1">{errors.biggest_constraint}</p>}
            </div>
            <div>
              <label htmlFor="tried_and_failed" className={labelBase}>What have you tried that didn&apos;t work?</label>
              <textarea id="tried_and_failed" placeholder="What strategies, hires, or investments haven't paid off?" value={form.tried_and_failed} onChange={(e) => update('tried_and_failed', e.target.value)} className={textareaBase} rows={3} />
            </div>
            <div>
              <label htmlFor="goal_next_90_days" className={labelBase}>What would a win look like in the next 90 days?</label>
              <textarea id="goal_next_90_days" placeholder="What specific outcome would make the next 90 days a success?" value={form.goal_next_90_days} onChange={(e) => update('goal_next_90_days', e.target.value)} className={textareaBase} rows={3} />
            </div>
            <div>
              <label htmlFor="anything_else" className={labelBase}>Anything else Chandler should know before your episode?</label>
              <textarea id="anything_else" placeholder="Any context, concerns, or topics you'd like to cover..." value={form.anything_else} onChange={(e) => update('anything_else', e.target.value)} className={textareaBase} rows={3} />
            </div>
          </div>
        </div>

        {/* Submit */}
        {errors.form && (
          <div className={`rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-4 mb-6 text-center`}>
            <p className="text-red-400 text-sm">{errors.form}</p>
          </div>
        )}
        <button type="submit" disabled={submitting} className="btn-gradient !flex w-full h-14 items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? 'Submitting...' : (<>Submit Questionnaire <ArrowRight className="w-4 h-4" /></>)}
        </button>
        <p className={`text-sm text-center mt-4 ${muted}`}>Fields marked with * are required. Everything else is optional but helps us prepare.</p>
      </form>
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
