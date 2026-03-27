'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
  plan_type: 'monthly' | 'one_time' | null
  current_period_end: string | null
}

export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('subscriptions')
        .select('status, plan_type, current_period_end')
        .eq('user_id', userId)
        .single()

      setSubscription(data as Subscription | null)
      setLoading(false)
    }

    load()
  }, [userId])

  const isActive = subscription?.status === 'active'

  return { subscription, loading, isActive }
}
