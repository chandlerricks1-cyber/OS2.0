import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'crucible-podcast-theme'

export function useSystemTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check localStorage first (user's manual choice)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsDark(stored === 'dark')
      return
    }
    // Otherwise follow system preference
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        setIsDark(e.matches)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
      return next
    })
  }, [])

  return { isDark, toggle }
}
