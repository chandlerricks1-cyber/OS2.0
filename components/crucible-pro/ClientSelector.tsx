'use client'

import type { ClientOption } from '@/types/cruciblePro'

export function ClientSelector({
  clients,
  value,
  onChange,
}: {
  clients: ClientOption[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-4 flex items-center gap-3">
      <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Viewing client</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 max-w-md text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
      >
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.full_name ? `${c.full_name} — ${c.email}` : c.email}
            {c.crucible_pro_status === 'active' ? ' ★ Pro' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
