'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { grantCrucibleProAccess } from '@/lib/actions'

interface PendingClient {
  id: string
  email: string
  full_name: string | null
  crucible_pro_status: string | null
  created_at: string
}

function GrantButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => grantCrucibleProAccess(userId))}
      className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {isPending ? 'Granting...' : 'Grant Pro'}
    </button>
  )
}

export function PendingProList({ clients }: { clients: PendingClient[] }) {
  if (clients.length === 0) return null

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-2xl border border-amber-200 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{client.full_name ?? '—'}</p>
                <p className="text-gray-400 text-xs truncate">{client.email}</p>
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 shrink-0">
                Pending
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <Link
                href={`/dashboard/admin/clients/${client.id}`}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                View profile →
              </Link>
              <GrantButton userId={client.id} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:block bg-white rounded-2xl border border-amber-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-amber-100 bg-amber-50/50">
              <th className="text-left px-5 py-3 text-xs font-medium text-amber-700 uppercase tracking-wide">Client</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-amber-700 uppercase tracking-wide">Signed Up</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-amber-700 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <Link href={`/dashboard/admin/clients/${client.id}`} className="hover:underline">
                    <p className="font-medium text-gray-900">{client.full_name ?? '—'}</p>
                    <p className="text-gray-400 text-xs">{client.email}</p>
                  </Link>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-5 py-3">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    Pending Upgrade
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <GrantButton userId={client.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
