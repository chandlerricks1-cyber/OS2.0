'use client'

import { useState } from 'react'
import type { SettingsPreferences } from './SettingsShell'

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
]

function tzLabel(tz: string): string {
  return tz.replace(/_/g, ' ').replace(/\//g, ' / ')
}

export function PreferencesTab({ preferences }: { preferences: SettingsPreferences }) {
  const [emailReports, setEmailReports] = useState(preferences.email_reports)
  const [emailUpdates, setEmailUpdates] = useState(preferences.email_updates)
  const [timezone, setTimezone] = useState(preferences.timezone ?? 'America/New_York')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/settings/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_reports: emailReports,
          email_updates: emailUpdates,
          timezone,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setMessage({ type: 'success', text: 'Preferences saved' })
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Notifications */}
      <div className="bg-white border border-gray-200 rounded-[25px] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Email notifications
        </h2>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-medium text-gray-700">Report emails</p>
            <p className="text-xs text-gray-400">Receive emails when new reports are generated</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={emailReports}
            onClick={() => setEmailReports(!emailReports)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              emailReports ? 'bg-brand-orange' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                emailReports ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-medium text-gray-700">Product updates</p>
            <p className="text-xs text-gray-400">Receive emails about new features and improvements</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={emailUpdates}
            onClick={() => setEmailUpdates(!emailUpdates)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              emailUpdates ? 'bg-brand-orange' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                emailUpdates ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </label>
      </div>

      {/* Timezone */}
      <div className="bg-white border border-gray-200 rounded-[25px] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Timezone
        </h2>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 bg-white"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tzLabel(tz)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save preferences'}
        </button>
        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}
