'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BusinessMetrics } from '@/types/metrics'
import type { PrimaryOffer, CROBlocker } from '@/types/intake'

interface MetricsEditorProps {
  metrics: BusinessMetrics | null
  triggerLabel?: string
  triggerClassName?: string
  defaultOpen?: boolean
  /** When true, the component renders nothing when closed — relies on external triggers via the `crucible:open-metrics-editor` event. */
  headless?: boolean
}

interface OfferRow {
  name: string
  price: string
  price_type: PrimaryOffer['price_type'] | ''
  description: string
}

interface BlockerRow {
  rank: string
  title: string
  explanation: string
  cro_lever: string
}

interface FormState {
  company_name: string
  website: string
  revenue_goal_1yr: string
  business_type: string
  industry: string
  cac: string
  ltv: string
  gross_profit_per_customer: string
  gross_profit_first_30_days: string
  lifetime_gross_profit_per_customer: string
  cash_collected_first_30_days: string
  monthly_revenue: string
  monthly_new_customers: string
  close_rate: string
  offers: OfferRow[]
  blockers: BlockerRow[]
}

const EMPTY_OFFER: OfferRow = { name: '', price: '', price_type: '', description: '' }
const EMPTY_BLOCKER: BlockerRow = { rank: '', title: '', explanation: '', cro_lever: '' }

function offersFrom(metrics: BusinessMetrics | null): OfferRow[] {
  const raw = (metrics?.primary_offers ?? null) as PrimaryOffer[] | null
  if (!raw || raw.length === 0) return []
  return raw.map((o) => ({
    name: o.name ?? '',
    price: o.price != null ? o.price.toString() : '',
    price_type: o.price_type ?? '',
    description: o.description ?? '',
  }))
}

function blockersFrom(metrics: BusinessMetrics | null): BlockerRow[] {
  const raw = (metrics?.cro_blockers ?? null) as CROBlocker[] | null
  if (!raw || raw.length === 0) return []
  return raw.map((b) => ({
    rank: b.rank?.toString() ?? '',
    title: b.title ?? '',
    explanation: b.explanation ?? '',
    cro_lever: b.cro_lever ?? '',
  }))
}

function toForm(m: BusinessMetrics | null): FormState {
  return {
    company_name: m?.company_name ?? '',
    website: m?.website ?? '',
    revenue_goal_1yr: m?.revenue_goal_1yr?.toString() ?? '',
    business_type: m?.business_type ?? '',
    industry: m?.industry ?? '',
    cac: m?.cac?.toString() ?? '',
    ltv: m?.ltv?.toString() ?? '',
    gross_profit_per_customer: m?.gross_profit_per_customer?.toString() ?? '',
    gross_profit_first_30_days: m?.gross_profit_first_30_days?.toString() ?? '',
    lifetime_gross_profit_per_customer: m?.lifetime_gross_profit_per_customer?.toString() ?? '',
    cash_collected_first_30_days: m?.cash_collected_first_30_days?.toString() ?? '',
    monthly_revenue: m?.monthly_revenue?.toString() ?? '',
    monthly_new_customers: m?.monthly_new_customers?.toString() ?? '',
    close_rate: m?.close_rate != null ? (m.close_rate * 100).toFixed(1) : '',
    offers: offersFrom(m),
    blockers: blockersFrom(m),
  }
}

function parseNum(val: string): number | null {
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

function calcDerived(f: FormState) {
  const cac = parseNum(f.cac)
  const ltv = parseNum(f.ltv)
  const gp = parseNum(f.gross_profit_per_customer)
  const cash = parseNum(f.cash_collected_first_30_days)

  const ratio = cac && ltv ? (ltv / cac).toFixed(2) : null
  const payback = cac && gp ? (cac / gp).toFixed(1) : null
  const required = cac && cash != null ? (cac - cash).toFixed(2) : null

  return { ratio, payback, required }
}

export function MetricsEditor({
  metrics,
  triggerLabel = 'Edit Metrics',
  triggerClassName,
  defaultOpen = false,
  headless = true,
}: MetricsEditorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(defaultOpen)
  const [form, setForm] = useState<FormState>(() => toForm(metrics))
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Listen for global "open editor" events so empty cards/banners can trigger this.
  useEffect(() => {
    function onOpen() {
      setForm(toForm(metrics))
      setError(null)
      setOpen(true)
    }
    window.addEventListener('crucible:open-metrics-editor', onOpen)
    return () => window.removeEventListener('crucible:open-metrics-editor', onOpen)
  }, [metrics])

  const derived = calcDerived(form)
  const hasRow = metrics !== null

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function setOffer(i: number, patch: Partial<OfferRow>) {
    setForm((prev) => ({
      ...prev,
      offers: prev.offers.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    }))
  }

  function setBlocker(i: number, patch: Partial<BlockerRow>) {
    setForm((prev) => ({
      ...prev,
      blockers: prev.blockers.map((b, idx) => (idx === i ? { ...b, ...patch } : b)),
    }))
  }

  function addOffer() {
    setForm((prev) => ({ ...prev, offers: [...prev.offers, { ...EMPTY_OFFER }] }))
  }

  function removeOffer(i: number) {
    setForm((prev) => ({ ...prev, offers: prev.offers.filter((_, idx) => idx !== i) }))
  }

  function addBlocker() {
    const nextRank = (form.blockers.length + 1).toString()
    setForm((prev) => ({
      ...prev,
      blockers: [...prev.blockers, { ...EMPTY_BLOCKER, rank: nextRank }],
    }))
  }

  function removeBlocker(i: number) {
    setForm((prev) => ({ ...prev, blockers: prev.blockers.filter((_, idx) => idx !== i) }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const cleanedOffers: PrimaryOffer[] = form.offers
        .filter((o) => o.name.trim().length > 0)
        .map((o) => ({
          name: o.name.trim(),
          price: parseNum(o.price),
          price_type: o.price_type === '' ? null : o.price_type,
          description: o.description.trim() || null,
        }))

      const cleanedBlockers: CROBlocker[] = form.blockers
        .filter((b) => b.title.trim().length > 0)
        .map((b, i) => ({
          rank: parseNum(b.rank) ?? i + 1,
          title: b.title.trim(),
          explanation: b.explanation.trim(),
          cro_lever: b.cro_lever.trim(),
        }))

      const res = await fetch('/api/metrics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: form.company_name || null,
          website: form.website || null,
          revenue_goal_1yr: parseNum(form.revenue_goal_1yr),
          business_type: form.business_type || null,
          industry: form.industry || null,
          cac: parseNum(form.cac),
          ltv: parseNum(form.ltv),
          gross_profit_per_customer: parseNum(form.gross_profit_per_customer),
          gross_profit_first_30_days: parseNum(form.gross_profit_first_30_days),
          lifetime_gross_profit_per_customer: parseNum(form.lifetime_gross_profit_per_customer),
          cash_collected_first_30_days: parseNum(form.cash_collected_first_30_days),
          monthly_revenue: parseNum(form.monthly_revenue),
          monthly_new_customers: parseNum(form.monthly_new_customers),
          close_rate: parseNum(form.close_rate) != null ? parseNum(form.close_rate)! / 100 : null,
          primary_offers: cleanedOffers.length > 0 ? cleanedOffers : null,
          cro_blockers: cleanedBlockers.length > 0 ? cleanedBlockers : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save')
      }
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleClear() {
    if (!confirm('This will clear all your metrics and invalidate your report. You can re-run the intake to repopulate them. Continue?')) return
    setClearing(true)
    try {
      await fetch('/api/metrics', { method: 'DELETE' })
      router.refresh()
    } finally {
      setClearing(false)
    }
  }

  if (!open) {
    if (headless) return null
    return (
      <button
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          'text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors'
        }
      >
        {triggerLabel}
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {hasRow ? 'Edit Metrics' : 'Fill In Your Metrics'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {hasRow
              ? 'Changes will invalidate your cached report — a fresh one will be generated on next visit.'
              : 'Enter what you know now — you can refine later. Once the core fields are filled you can generate your CRO report.'}
          </p>
        </div>
        <button
          onClick={() => { setOpen(false); setForm(toForm(metrics)); setError(null) }}
          className="text-gray-400 hover:text-gray-700 text-sm"
        >
          Cancel
        </button>
      </div>

      {/* Business info */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Business Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Company Name" value={form.company_name} onChange={(v) => set('company_name', v)} placeholder="e.g. Acme Pest Control" />
          <Field label="Website" value={form.website} onChange={(v) => set('website', v)} placeholder="e.g. acmepest.com" />
          <Field label="1-Year Revenue Goal ($)" value={form.revenue_goal_1yr} onChange={(v) => set('revenue_goal_1yr', v)} type="number" placeholder="0" />
          <Field label="Business Type" value={form.business_type} onChange={(v) => set('business_type', v)} placeholder="e.g. Service Business" />
          <Field label="Industry" value={form.industry} onChange={(v) => set('industry', v)} placeholder="e.g. Pest Control" />
        </div>
      </div>

      {/* Core economics */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Core Economics</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="CAC ($)" value={form.cac} onChange={(v) => set('cac', v)} type="number" placeholder="0" />
          <Field label="LTV ($)" value={form.ltv} onChange={(v) => set('ltv', v)} type="number" placeholder="0" />
          <Field label="Monthly Gross Profit / Customer ($)" value={form.gross_profit_per_customer} onChange={(v) => set('gross_profit_per_customer', v)} type="number" placeholder="0" />
          <Field label="Cash Collected First 30 Days ($)" value={form.cash_collected_first_30_days} onChange={(v) => set('cash_collected_first_30_days', v)} type="number" placeholder="0" />
          <Field label="Monthly Revenue ($)" value={form.monthly_revenue} onChange={(v) => set('monthly_revenue', v)} type="number" placeholder="0" />
          <Field label="Monthly New Customers" value={form.monthly_new_customers} onChange={(v) => set('monthly_new_customers', v)} type="number" placeholder="0" />
          <Field label="Close Rate (%)" value={form.close_rate} onChange={(v) => set('close_rate', v)} type="number" placeholder="0" />
        </div>
      </div>

      {/* Gross profit split */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Gross Profit Detail</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="30-Day Gross Profit ($)"
            value={form.gross_profit_first_30_days}
            onChange={(v) => set('gross_profit_first_30_days', v)}
            type="number"
            placeholder="Cash collected in 30 days − delivery costs"
          />
          <Field
            label="Lifetime Gross Profit / Customer ($)"
            value={form.lifetime_gross_profit_per_customer}
            onChange={(v) => set('lifetime_gross_profit_per_customer', v)}
            type="number"
            placeholder="LTV minus total delivery costs"
          />
        </div>
      </div>

      {/* Primary offers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Primary Offers</p>
          <button
            onClick={addOffer}
            type="button"
            className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2 py-1"
          >
            + Add offer
          </button>
        </div>
        {form.offers.length === 0 ? (
          <p className="text-xs text-gray-400">No offers yet. Add the products or services you sell.</p>
        ) : (
          <div className="space-y-3">
            {form.offers.map((offer, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Field label="Name" value={offer.name} onChange={(v) => setOffer(i, { name: v })} placeholder="e.g. Quarterly Pest Plan" />
                  <Field label="Price ($)" value={offer.price} onChange={(v) => setOffer(i, { price: v })} type="number" placeholder="0" />
                  <SelectField
                    label="Billing"
                    value={offer.price_type ?? ''}
                    onChange={(v) => setOffer(i, { price_type: v as OfferRow['price_type'] })}
                    options={[
                      { value: '', label: '—' },
                      { value: 'one_time', label: 'One-time' },
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'annual', label: 'Annual' },
                      { value: 'custom', label: 'Custom' },
                    ]}
                  />
                </div>
                <Field
                  label="Description"
                  value={offer.description}
                  onChange={(v) => setOffer(i, { description: v })}
                  placeholder="Optional short description"
                />
                <div className="text-right">
                  <button
                    onClick={() => removeOffer(i)}
                    type="button"
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Growth blockers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Top Growth Blockers</p>
          <button
            onClick={addBlocker}
            type="button"
            className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2 py-1"
          >
            + Add blocker
          </button>
        </div>
        {form.blockers.length === 0 ? (
          <p className="text-xs text-gray-400">No blockers listed. Add the things slowing your growth, ranked by impact.</p>
        ) : (
          <div className="space-y-3">
            {form.blockers.map((blocker, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Field
                    label="Rank"
                    value={blocker.rank}
                    onChange={(v) => setBlocker(i, { rank: v })}
                    type="number"
                    placeholder="1"
                  />
                  <Field
                    label="Title"
                    value={blocker.title}
                    onChange={(v) => setBlocker(i, { title: v })}
                    placeholder="e.g. Low close rate on quotes"
                  />
                  <Field
                    label="CRO Lever"
                    value={blocker.cro_lever}
                    onChange={(v) => setBlocker(i, { cro_lever: v })}
                    placeholder="e.g. sales, retention"
                  />
                </div>
                <Field
                  label="Explanation"
                  value={blocker.explanation}
                  onChange={(v) => setBlocker(i, { explanation: v })}
                  placeholder="Why this blocks growth"
                />
                <div className="text-right">
                  <button
                    onClick={() => removeBlocker(i)}
                    type="button"
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Derived preview */}
      {(derived.ratio || derived.payback || derived.required) && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Calculated (auto-derived)</p>
          <div className="grid grid-cols-3 gap-4">
            {derived.ratio && (
              <div>
                <p className="text-xs text-gray-400">LTV:CAC Ratio</p>
                <p className="text-sm font-semibold text-gray-900">{derived.ratio}x</p>
              </div>
            )}
            {derived.payback && (
              <div>
                <p className="text-xs text-gray-400">CAC Payback</p>
                <p className="text-sm font-semibold text-gray-900">{derived.payback} mo</p>
              </div>
            )}
            {derived.required && (
              <div>
                <p className="text-xs text-gray-400">Required 30-Day Revenue</p>
                <p className="text-sm font-semibold text-gray-900">${derived.required}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center justify-between pt-1">
        {hasRow ? (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            {clearing ? 'Clearing…' : 'Clear all metrics'}
          </button>
        ) : <span />}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
