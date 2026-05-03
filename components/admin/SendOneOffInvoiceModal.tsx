'use client'

import { useEffect, useState, useTransition } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { sendRetainerOneOffInvoice } from '@/lib/actions'

interface SendOneOffInvoiceModalProps {
  open: boolean
  userId: string
  defaultAmount: number | null
  onClose: () => void
  onSent?: () => void
}

export function SendOneOffInvoiceModal({
  open,
  userId,
  defaultAmount,
  onClose,
  onSent,
}: SendOneOffInvoiceModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hostedUrl, setHostedUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setAmount(defaultAmount != null ? String(defaultAmount) : '')
      setDescription('')
      setError(null)
      setHostedUrl(null)
    }
  }, [open, defaultAmount])

  if (!open) return null

  function submit() {
    setError(null)
    const amountNum = Number(amount)
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError('Enter a positive amount')
      return
    }
    if (!description.trim()) {
      setError('Add a description (shown on the invoice)')
      return
    }
    startTransition(async () => {
      try {
        const res = await sendRetainerOneOffInvoice(userId, amountNum, description.trim())
        setHostedUrl(res.hostedUrl)
        onSent?.()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to send invoice')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-xl">
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Send one-off invoice</h3>
            <p className="mt-1 text-sm text-gray-500">
              Stripe will email the client a hosted invoice with a pay-now button.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {hostedUrl ? (
          <div className="p-5 space-y-3">
            <p className="text-sm text-gray-700">
              Invoice sent. Stripe has emailed the client. You can also share the link directly:
            </p>
            <a
              href={hostedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand-orange hover:underline break-all"
            >
              {hostedUrl}
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Amount (USD)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="6500"
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Description (visible to client)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Crucible Pro retainer — May 2026"
                className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
              >
                {isPending ? 'Sending…' : 'Send via Stripe'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
