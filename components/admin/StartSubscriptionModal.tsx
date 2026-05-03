'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, ExternalLink, X } from 'lucide-react'

interface StartSubscriptionModalProps {
  open: boolean
  url: string | null
  onClose: () => void
}

export function StartSubscriptionModal({ open, url, onClose }: StartSubscriptionModalProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  if (!open) return null

  async function copy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore — older browsers
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-xl">
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Subscription checkout link</h3>
            <p className="mt-1 text-sm text-gray-500">
              Send this link to the client. They&apos;ll enter payment and the recurring retainer
              starts after the first charge.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex gap-2">
            <input
              readOnly
              value={url ?? ''}
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
            />
            <button
              onClick={copy}
              disabled={!url}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand-orange hover:underline"
            >
              Preview the checkout page
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <p className="text-xs text-gray-500">
            This link expires after 24 hours. Generate a new one if needed.
          </p>
        </div>
      </div>
    </div>
  )
}
