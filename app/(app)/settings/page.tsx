import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsShell } from '@/components/settings/SettingsShell'
import type { TabId } from '@/components/settings/SettingsShell'

const VALID_TABS = new Set<TabId>(['profile', 'business', 'billing', 'security', 'preferences', 'account'])

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: metrics }, { data: subscription }, { data: preferences }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at')
        .eq('id', user.id)
        .single(),
      supabase
        .from('business_metrics')
        .select('company_name, website, industry, business_type')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('subscriptions')
        .select('status, plan_type, current_period_end, stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('user_preferences')
        .select('email_reports, email_updates, timezone')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

  if (!profile) redirect('/login')

  const initialTab: TabId = tab && VALID_TABS.has(tab as TabId) ? (tab as TabId) : 'profile'

  return (
    <SettingsShell
      initialTab={initialTab}
      profile={profile}
      metrics={metrics}
      subscription={subscription}
      preferences={preferences ?? { email_reports: true, email_updates: true, timezone: 'America/New_York' }}
    />
  )
}
