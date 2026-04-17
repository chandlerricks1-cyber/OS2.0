'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SettingsMetrics } from './SettingsShell'

export function BusinessTab({ metrics }: { metrics: SettingsMetrics | null }) {
  const router = useRouter()
  const [companyName, setCompanyName] = useState(metrics?.company_name ?? '')
  const [website, setWebsite] = useState(metrics?.website ?? '')
  const [industry, setIndustry] = useState(metrics?.industry ?? '')
  const [businessType, setBusinessType] = useState(metrics?.business_type ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/settings/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          website,
          industry,
          business_type: businessType,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setMessage({ type: 'success', text: 'Business info updated' })
      router.refresh()
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  if (!metrics) {
    return (
      <div className="bg-white border border-gray-200 rounded-[25px] p-6">
        <p className="text-sm text-gray-500">
          Complete the intake process first to populate your business information.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Business information
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          placeholder="Acme Inc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          placeholder="e.g. SaaS, E-commerce, Consulting"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business type</label>
        <input
          type="text"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          placeholder="e.g. B2B, B2C, Agency"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
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
