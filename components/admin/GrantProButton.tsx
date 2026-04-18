'use client'

import { useTransition } from 'react'
import { grantCrucibleProAccess, revokeCrucibleProAccess } from '@/lib/actions'

interface GrantProButtonProps {
  userId: string
  currentStatus: string | null
}

export function GrantProButton({ userId, currentStatus }: GrantProButtonProps) {
  const [isPending, startTransition] = useTransition()

  if (currentStatus === 'active') {
    return (
      <button
        disabled={isPending}
        onClick={() => startTransition(() => revokeCrucibleProAccess(userId))}
        className="mt-3 w-full px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Revoking...' : 'Revoke Access'}
      </button>
    )
  }

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => grantCrucibleProAccess(userId))}
      className="mt-3 w-full px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {isPending ? 'Granting...' : 'Grant Crucible Pro'}
    </button>
  )
}
