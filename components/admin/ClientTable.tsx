'use client'

import Link from 'next/link'
import { formatCurrency, formatMonths } from '@/lib/utils/metrics'

interface Client {
  id: string
  email: string
  full_name: string | null
  created_at: string
  intake_sessions: Array<{ status: string; completed_at: string | null }> | null
  subscriptions: Array<{ status: string; plan_type: string | null }> | null
  business_metrics: Array<{ cac: number | null; ltv: number | null; cac_payback_months: number | null }> | null
  client_tags: Array<{ tag: string }> | null
}

interface ClientTableProps {
  clients: Client[]
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-amber-100 text-amber-700',
    past_due: 'bg-red-100 text-red-700',
    canceled: 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export function ClientTable({ clients }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No clients yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Client</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Intake</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subscription</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">CAC</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">LTV</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Payback</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tags</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {clients.map((client) => {
            const session = client.intake_sessions?.[0]
            const subscription = client.subscriptions?.[0]
            const metrics = client.business_metrics?.[0]
            const tags = client.client_tags ?? []

            return (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{client.full_name ?? '—'}</p>
                  <p className="text-gray-400 text-xs">{client.email}</p>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={session?.status ?? 'not started'} />
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={subscription?.status ?? 'inactive'} />
                  {subscription?.plan_type && (
                    <p className="text-xs text-gray-400 mt-0.5">{subscription.plan_type}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-700">{formatCurrency(metrics?.cac ?? null)}</td>
                <td className="px-5 py-3 text-gray-700">{formatCurrency(metrics?.ltv ?? null)}</td>
                <td className="px-5 py-3 text-gray-700">{formatMonths(metrics?.cac_payback_months ?? null)}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((t) => (
                      <span key={t.tag} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                        {t.tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="text-xs text-gray-400">+{tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
