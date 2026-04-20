'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteClient } from '@/lib/actions'

export function ClientDeleteButton({ userId, clientName }: { userId: string; clientName: string }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

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
      <span className="text-xs text-red-700">Delete {clientName}? This cannot be undone.</span>
      <button
        onClick={() => startTransition(() => deleteClient(userId))}
        disabled={isPending}
        className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-medium disabled:opacity-50"
      >
        {isPending ? 'Deleting...' : 'Confirm'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={isPending}
        className="px-2.5 py-1 text-red-600 text-xs font-medium"
      >
        Cancel
      </button>
    </div>
  )
}
