'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, FileText, Calendar, Pencil, ExternalLink } from 'lucide-react'
import type { BillingSnapshot } from '@/types/cruciblePro'

export function BillingTab({
  billing,
  targetUserId,
  isAdmin,
}: {
  billing: BillingSnapshot
  targetUserId: string
  isAdmin: boolean
}) {
  const nextBilling = billing.next_billing_date ?? billing.current_period_end

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FeeCard billing={billing} targetUserId={targetUserId} isAdmin={isAdmin} />
      <AgreementCard billing={billing} targetUserId={targetUserId} isAdmin={isAdmin} />
      <NextBillingCard nextBilling={nextBilling} targetUserId={targetUserId} isAdmin={isAdmin} />
      <PaymentMethodCard billing={billing} />
    </div>
  )
}

function FeeCard({
  billing,
  targetUserId,
  isAdmin,
}: {
  billing: BillingSnapshot
  targetUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(billing.monthly_consulting_fee?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await fetch('/api/crucible-pro/billing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: targetUserId,
        monthly_consulting_fee: value === '' ? null : Number(value),
      }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold">
          <CreditCard className="w-4 h-4" />
          Monthly consulting fee
        </div>
        {isAdmin && !editing && (
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-700">
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">$</span>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              placeholder="5000"
            />
            <span className="text-xs text-gray-500">/ month</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="px-3 py-1.5 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500 hover:text-gray-900">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 text-3xl font-bold text-gray-900">
          {billing.monthly_consulting_fee != null ? formatCurrency(billing.monthly_consulting_fee) : '—'}
          {billing.monthly_consulting_fee != null && (
            <span className="text-sm font-normal text-gray-500 ml-1">/ mo</span>
          )}
        </div>
      )}
    </div>
  )
}

function AgreementCard({
  billing,
  targetUserId,
  isAdmin,
}: {
  billing: BillingSnapshot
  targetUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(billing.client_agreement_url ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await fetch('/api/crucible-pro/billing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: targetUserId,
        client_agreement_url: value || null,
      }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold">
          <FileText className="w-4 h-4" />
          Client agreement
        </div>
        {isAdmin && !editing && (
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-700">
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-3 space-y-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
            placeholder="https://…/agreement.pdf"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="px-3 py-1.5 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500 hover:text-gray-900">
              Cancel
            </button>
          </div>
        </div>
      ) : billing.client_agreement_url ? (
        <a
          href={billing.client_agreement_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-brand-orange hover:underline text-sm font-medium"
        >
          View PDF agreement
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : (
        <p className="mt-3 text-sm text-gray-500">No agreement linked yet.</p>
      )}
    </div>
  )
}

function NextBillingCard({
  nextBilling,
  targetUserId,
  isAdmin,
}: {
  nextBilling: string | null
  targetUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const initial = nextBilling ? new Date(nextBilling).toISOString().slice(0, 10) : ''
  const [value, setValue] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await fetch('/api/crucible-pro/billing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: targetUserId, next_billing_date: value || null }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold">
          <Calendar className="w-4 h-4" />
          Next billing date
        </div>
        {isAdmin && !editing && (
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-700">
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-3 space-y-2">
          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="px-3 py-1.5 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500 hover:text-gray-900">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 text-xl font-bold text-gray-900">
          {nextBilling ? new Date(nextBilling).toLocaleDateString(undefined, { dateStyle: 'long' }) : '—'}
        </div>
      )}
    </div>
  )
}

function PaymentMethodCard({ billing }: { billing: BillingSnapshot }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function openPortal() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/billing-portal', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to open portal')
      window.location.href = json.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open portal')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold">
        <CreditCard className="w-4 h-4" />
        Payment method
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Update your card, view invoices, or cancel through the secure Stripe portal.
      </p>
      <button
        onClick={openPortal}
        disabled={loading || !billing.stripe_customer_id}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
      >
        {loading ? 'Opening…' : 'Manage billing in Stripe'}
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
      {!billing.stripe_customer_id && (
        <p className="mt-2 text-xs text-gray-500">
          Available once an active Stripe subscription is on file.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}
