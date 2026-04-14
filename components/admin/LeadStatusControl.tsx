'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const statuses = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'intake_complete', label: 'Intake Complete', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'recorded', label: 'Recorded', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-500 border-gray-200' },
]

export function LeadStatusControl({ leadId, currentStatus }: { leadId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleChange(newStatus: string) {
    if (newStatus === status) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/podcast/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, status: newStatus }),
      })
      if (res.ok) {
        setStatus(newStatus)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => (
        <button
          key={s.value}
          onClick={() => handleChange(s.value)}
          disabled={saving}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            status === s.value
              ? `${s.color} ring-2 ring-offset-1 ring-current`
              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
          } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
