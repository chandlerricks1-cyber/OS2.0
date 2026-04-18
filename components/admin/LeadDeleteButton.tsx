'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function LeadDeleteButton({ leadId, leadName }: { leadId: string; leadName: string }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/podcast/${leadId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/dashboard/admin/podcast')
        router.refresh()
      }
    } finally {
      setDeleting(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <span className="text-xs text-red-700">Delete {leadName}?</span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-medium disabled:opacity-50"
      >
        {deleting ? 'Deleting...' : 'Confirm'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="px-2.5 py-1 text-red-600 text-xs font-medium"
      >
        Cancel
      </button>
    </div>
  )
}
