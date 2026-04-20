'use client'

import { useState, useTransition } from 'react'
import { convertLeadToClient } from '@/lib/actions'

interface ConvertToClientButtonProps {
  leadId: string
  leadName: string
  leadEmail: string
}

export function ConvertToClientButton({ leadId, leadName, leadEmail }: ConvertToClientButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end rounded-lg hover:opacity-90 transition-opacity"
      >
        Convert to Client
      </button>
    )
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <p className="text-sm text-amber-800 mb-1 font-medium">Convert to client account?</p>
      <p className="text-xs text-amber-600 mb-3">
        This will create a login for <strong>{leadName}</strong> ({leadEmail}) and send them an invite email.
        You can then grant Crucible Pro access from the Clients page.
      </p>
      {error && (
        <p className="text-xs text-red-600 mb-3">{error}</p>
      )}
      <div className="flex items-center gap-2">
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setError(null)
              const result = await convertLeadToClient(leadId)
              if (result?.error) {
                setError(result.error)
              }
            })
          }
          className="px-3 py-1.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Converting...' : 'Yes, Convert'}
        </button>
        <button
          disabled={isPending}
          onClick={() => { setShowConfirm(false); setError(null) }}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
