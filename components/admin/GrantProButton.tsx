'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { grantCrucibleProAccess, revokeCrucibleProAccess } from '@/lib/actions'

interface GrantProButtonProps {
  userId: string
  currentStatus: string | null
}

export function GrantProButton({ userId, currentStatus }: GrantProButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (currentStatus === 'active') {
    return (
      <div>
        <button
          disabled={isPending}
          onClick={() => {
            setError(null)
            startTransition(async () => {
              try {
                await revokeCrucibleProAccess(userId)
                router.refresh()
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to revoke access')
              }
            })
          }}
          className="mt-3 w-full px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Revoking...' : 'Revoke Access'}
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <button
        disabled={isPending}
        onClick={() => {
          setError(null)
          startTransition(async () => {
            try {
              await grantCrucibleProAccess(userId)
              router.refresh()
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Failed to grant access')
            }
          })
        }}
        className="mt-3 w-full px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? 'Granting...' : 'Grant Crucible Pro'}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
