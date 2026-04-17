'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileTab } from './ProfileTab'
import { BusinessTab } from './BusinessTab'
import { BillingSettingsTab } from './BillingSettingsTab'
import { SecurityTab } from './SecurityTab'
import { PreferencesTab } from './PreferencesTab'
import { AccountTab } from './AccountTab'

export type TabId = 'profile' | 'business' | 'billing' | 'security' | 'preferences' | 'account'

const TABS: { id: TabId; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'business', label: 'Business' },
  { id: 'billing', label: 'Billing' },
  { id: 'security', label: 'Security' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'account', label: 'Account' },
]

export interface SettingsProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface SettingsMetrics {
  company_name: string | null
  website: string | null
  industry: string | null
  business_type: string | null
}

export interface SettingsSubscription {
  status: string
  plan_type: string | null
  current_period_end: string | null
  stripe_customer_id: string | null
}

export interface SettingsPreferences {
  email_reports: boolean
  email_updates: boolean
  timezone: string | null
}

export function SettingsShell({
  initialTab,
  profile,
  metrics,
  subscription,
  preferences,
}: {
  initialTab: TabId
  profile: SettingsProfile
  metrics: SettingsMetrics | null
  subscription: SettingsSubscription | null
  preferences: SettingsPreferences
}) {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>(initialTab)

  function go(next: TabId) {
    setTab(next)
    const qs = next !== 'profile' ? `?tab=${next}` : ''
    router.replace(`/settings${qs}`, { scroll: false })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile, business info, billing, and account preferences.
        </p>
      </div>

      <div className="border-b border-gray-200 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => go(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              tab === t.id
                ? 'border-brand-gradient-end text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab profile={profile} />}
      {tab === 'business' && <BusinessTab metrics={metrics} />}
      {tab === 'billing' && <BillingSettingsTab subscription={subscription} />}
      {tab === 'security' && <SecurityTab />}
      {tab === 'preferences' && <PreferencesTab preferences={preferences} />}
      {tab === 'account' && <AccountTab email={profile.email} />}
    </div>
  )
}
