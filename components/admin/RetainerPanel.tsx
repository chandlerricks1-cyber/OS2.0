'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Pencil, Send, Repeat } from 'lucide-react'
import { setMonthlyRetainerFee, startRetainerSubscription } from '@/lib/actions'
import { StartSubscriptionModal } from './StartSubscriptionModal'
import { SendOneOffInvoiceModal } from './SendOneOffInvoiceModal'

interface RetainerPanelProps {
  userId: string
  monthlyFee: number | null
  subscriptionStatus: string | null
  hasStripeSubscription: boolean
  currentPeriodEnd: string | null
}

export function RetainerPanel({
  userId,
  monthlyFee,
  subscriptionStatus,
  hasStripeSubscription,
  currentPeriodEnd,
}: RetainerPanelProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(monthlyFee != null ? String(monthlyFee) : '')
  const [feeError, setFeeError] = useState<string | null>(null)
  const [savingFee, startSaveTransition] = useTransition()

  const [subUrl, setSubUrl] = useState<string | null>(null)
  const [subOpen, setSubOpen] = useState(false)
  const [subError, setSubError] = useState<string | null>(null)
  const [subPending, startSubTransition] = useTransition()

  const [invoiceOpen, setInvoiceOpen] = useState(false)

  function saveFee() {
    setFeeError(null)
    const trimmed = value.trim()
    const parsed = trimmed === '' ? null : Number(trimmed)
    if (parsed !== null && (!Number.isFinite(parsed) || parsed < 0)) {
      setFeeError('Enter a non-negative number')
      return
    }
    startSaveTransition(async () => {
      try {
        await setMonthlyRetainerFee(userId, parsed)
        setEditing(false)
        router.refresh()
      } catch (e) {
        setFeeError(e instanceof Error ? e.message : 'Failed to save retainer')
      }
    })
  }

  function openSubscription() {
    setSubError(null)
    startSubTransition(async () => {
      try {
        const res = await startRetainerSubscription(userId)
        setSubUrl(res.url)
        setSubOpen(true)
      } catch (e) {
        setSubError(e instanceof Error ? e.message : 'Failed to start subscription')
      }
    })
  }

  const subActive = subscriptionStatus === 'active' && hasStripeSubscription

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Monthly retainer
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            {editing ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-32 text-base px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                  placeholder="6500"
                  autoFocus
                />
                <span className="text-xs text-gray-500">/ month</span>
              </div>
            ) : (
              <>
                <span className="text-3xl font-bold text-gray-900">
                  {monthlyFee != null ? formatCurrency(monthlyFee) : '—'}
                </span>
                {monthlyFee != null && (
                  <span className="text-sm text-gray-500">/ month</span>
                )}
              </>
            )}
          </div>
          {feeError && <p className="mt-1 text-xs text-red-600">{feeError}</p>}
        </div>

        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={saveFee}
              disabled={savingFee}
              className="px-3 py-1.5 rounded-lg bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
            >
              {savingFee ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => {
                setEditing(false)
                setValue(monthlyFee != null ? String(monthlyFee) : '')
                setFeeError(null)
              }}
              disabled={savingFee}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-gray-400 hover:text-gray-700 inline-flex items-center gap-1 text-sm"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span>Subscription:</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            subActive
              ? 'bg-green-100 text-green-700'
              : subscriptionStatus === 'past_due'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {subActive ? 'Active' : subscriptionStatus ?? 'inactive'}
          </span>
        </div>
        {currentPeriodEnd && (
          <div className="text-gray-600">
            Renews{' '}
            <span className="font-medium text-gray-900">
              {new Date(currentPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={openSubscription}
          disabled={subPending || !monthlyFee}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white text-sm font-semibold disabled:opacity-50"
        >
          <Repeat className="w-4 h-4" />
          {subPending
            ? 'Generating link…'
            : subActive
            ? 'Restart subscription'
            : 'Start subscription'}
        </button>
        <button
          onClick={() => setInvoiceOpen(true)}
          disabled={!monthlyFee}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Send one-off invoice
        </button>
      </div>
      {!monthlyFee && (
        <p className="text-xs text-gray-500">Set a retainer above before billing.</p>
      )}
      {subError && <p className="text-xs text-red-600">{subError}</p>}

      <StartSubscriptionModal
        open={subOpen}
        url={subUrl}
        onClose={() => setSubOpen(false)}
      />
      <SendOneOffInvoiceModal
        open={invoiceOpen}
        userId={userId}
        defaultAmount={monthlyFee}
        onClose={() => setInvoiceOpen(false)}
        onSent={() => router.refresh()}
      />
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
