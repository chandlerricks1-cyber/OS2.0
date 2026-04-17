'use client'

import { useState } from 'react'
import { CreditCard, ExternalLink } from 'lucide-react'
import type { SettingsSubscription } from './SettingsShell'

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
}

export function BillingSettingsTab({
  subscription,
}: {
  subscription: SettingsSubscription | null
}) {
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

  if (!subscription || subscription.status === 'inactive') {
    return (
      <div className="bg-white border border-gray-200 rounded-[25px] p-6 space-y-3">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold">
          <CreditCard className="w-4 h-4" />
          Subscription
        </div>
        <p className="text-sm text-gray-600">You don&apos;t have an active subscription.</p>
        <a
          href="/upgrade"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold"
        >
          View plans
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Plan overview */}
      <div className="bg-white border border-gray-200 rounded-[25px] p-6">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold mb-3">
          <CreditCard className="w-4 h-4" />
          Current plan
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-semibold text-gray-900">{formatStatus(subscription.status)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Plan</p>
            <p className="text-sm font-semibold text-gray-900">
              {subscription.plan_type ? formatStatus(subscription.plan_type) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Current period ends</p>
            <p className="text-sm font-semibold text-gray-900">
              {subscription.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
                    dateStyle: 'long',
                  })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Manage in Stripe */}
      <div className="bg-white border border-gray-200 rounded-[25px] p-6">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold mb-2">
          <CreditCard className="w-4 h-4" />
          Payment &amp; invoices
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Update your card, view invoices, or manage your subscription through the secure Stripe portal.
        </p>
        <button
          onClick={openPortal}
          disabled={loading || !subscription.stripe_customer_id}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
        >
          {loading ? 'Opening...' : 'Manage billing in Stripe'}
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
}
