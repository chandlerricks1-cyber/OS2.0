import { ExternalLink, FileText } from 'lucide-react'
import type { Invoice, InvoiceStatus } from '@/types/cruciblePro'

interface InvoiceHistoryListProps {
  invoices: Invoice[]
  emptyHint?: string
}

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  open: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  void: 'bg-gray-100 text-gray-500 line-through',
  uncollectible: 'bg-red-100 text-red-700',
}

export function InvoiceHistoryList({ invoices, emptyHint }: InvoiceHistoryListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold">
        <FileText className="w-4 h-4" />
        Recent invoices
      </div>

      {invoices.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">
          {emptyHint ?? 'No invoices yet. They’ll appear here once Stripe sends one.'}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {invoices.map((inv) => {
            const statusClass = STATUS_CLASSES[inv.status] ?? 'bg-gray-100 text-gray-600'
            const issuedAt = inv.finalized_at ?? inv.created_at
            return (
              <li key={inv.id} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {inv.description ?? (inv.invoice_type === 'subscription_cycle' ? 'Subscription' : 'One-off invoice')}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-gray-400">
                      {inv.invoice_type === 'subscription_cycle' ? 'Recurring' : 'One-off'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(issuedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    {inv.number ? ` · ${inv.number}` : ''}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900 tabular-nums">
                  {formatCents(inv.amount_cents, inv.currency)}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                  {inv.status}
                </span>
                {inv.hosted_invoice_url && (
                  <a
                    href={inv.hosted_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-700"
                    title="Open hosted invoice"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'usd').toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100)
}
