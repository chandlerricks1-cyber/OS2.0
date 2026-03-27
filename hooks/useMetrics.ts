'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BusinessMetrics } from '@/types/metrics'

export function useMetrics(userId: string) {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        setError(error.message)
      } else {
        setMetrics(data as BusinessMetrics | null)
      }
      setLoading(false)
    }

    load()
  }, [userId])

  return { metrics, loading, error }
}
