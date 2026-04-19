'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { formatCurrency, formatMonths } from '@/lib/utils/metrics'
import { grantCrucibleProAccess, revokeCrucibleProAccess } from '@/lib/actions'

interface Client {
  id: string
  email: string
  full_name: string | null
  created_at: string
  crucible_pro_status?: string | null
  intake_sessions: { status: string; completed_at: string | null } | null
  subscriptions: { status: string; plan_type: string | null } | null
  business_metrics: { cac: number | null; ltv: number | null; cac_payback_months: number | null } | null
  client_tags: Array<{ tag: string }>
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

function InlineProToggle({ userId, status }: { userId: string; status: string | null | undefined }) {
  const [isPending, startTransition] = useTransition()

  if (status === 'active') {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
        <button
          disabled={isPending}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            startTransition(() => revokeCrucibleProAccess(userId))
          }}
          className="text-[10px] text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {isPending ? '...' : 'Revoke'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'pending' ? (
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pending</span>
      ) : (
        <span className="text-xs text-gray-400">—</span>
      )}
      <button
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          startTransition(() => grantCrucibleProAccess(userId))
        }}
        className="text-[10px] font-medium text-brand-gradient-end hover:underline disabled:opacity-50"
      >
        {isPending ? '...' : 'Grant'}
      </button>
    </div>
  )
}

type Filter = 'all' | 'pending_pro'

export function ClientTable({ clients }: ClientTableProps) {
  const [filter, setFilter] = useState<Filter>('all')

  const pendingCount = clients.filter((c) => c.crucible_pro_status === 'pending').length
  const filtered = filter === 'pending_pro'
    ? clients.filter((c) => c.crucible_pro_status === 'pending')
    : clients

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No clients yet.</p>
      </div>
    )
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Clients
        </button>
        {pendingCount > 0 && (
          <button
            onClick={() => setFilter('pending_pro')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filter === 'pending_pro'
                ? 'bg-amber-500 text-white'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            Pending Pro Upgrade
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === 'pending_pro' ? 'bg-white/20' : 'bg-amber-200 text-amber-800'
            }`}>
              {pendingCount}
            </span>
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No clients match this filter.</p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {filtered.map((client) => {
              const session = client.intake_sessions
              const metrics = client.business_metrics
              const tags = client.client_tags ?? []
              return (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4"
                >
                  <Link href={`/dashboard/admin/clients/${client.id}`} className="block active:bg-gray-50">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{client.full_name ?? '—'}</p>
                        <p className="text-gray-400 text-xs truncate">{client.email}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">View →</span>
                    </div>
                  </Link>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Intake</p>
                      <StatusBadge status={session?.status ?? 'not started'} />
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Pro</p>
                      <InlineProToggle userId={client.id} status={client.crucible_pro_status} />
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">CAC</p>
                      <p className="text-gray-800">{formatCurrency(metrics?.cac ?? null)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">LTV</p>
                      <p className="text-gray-800">{formatCurrency(metrics?.ltv ?? null)}</p>
                    </div>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                      {tags.slice(0, 3).map((t) => (
                        <span key={t.tag} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                          {t.tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Intake</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Pro</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subscription</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">CAC</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">LTV</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Payback</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tags</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((client) => {
                const session = client.intake_sessions
                const subscription = client.subscriptions
                const metrics = client.business_metrics
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
                      <InlineProToggle userId={client.id} status={client.crucible_pro_status} />
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
                        href={`/dashboard/admin/clients/${client.id}`}
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
        </>
      )}
    </>
  )
}
