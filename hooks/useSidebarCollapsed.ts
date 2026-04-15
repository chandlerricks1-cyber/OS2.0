'use client'

import { useCallback, useEffect, useState } from 'react'

const KEY = 'crucible-sidebar-collapsed'

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw === '1') setCollapsed(true)
    } catch {}
    setHydrated(true)
  }, [])

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(KEY, next ? '1' : '0')
      } catch {}
      return next
    })
  }, [])

  return { collapsed, toggle, hydrated }
}
