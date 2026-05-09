'use client'

import type { ReactNode } from 'react'

interface OpenEditorButtonProps {
  children: ReactNode
  className?: string
}

export function OpenEditorButton({ children, className }: OpenEditorButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('crucible:open-metrics-editor'))}
      className={className}
    >
      {children}
    </button>
  )
}
