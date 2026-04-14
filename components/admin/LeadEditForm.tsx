'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X, Check } from 'lucide-react'

interface LeadInfo {
  id: string
  full_name: string
  email: string
  phone: string
  preferred_date: string
}

export function LeadEditForm({ lead }: { lead: LeadInfo }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    full_name: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    preferred_date: lead.preferred_date,
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/podcast/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setEditing(false)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" /> Edit
      </button>
    )
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 mt-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gradient-end"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gradient-end"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gradient-end"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Preferred Date</label>
          <input
            type="date"
            value={form.preferred_date}
            onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gradient-end"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gradient-end text-white rounded-lg text-xs font-medium disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setForm({ full_name: lead.full_name, email: lead.email, phone: lead.phone, preferred_date: lead.preferred_date }) }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-700 text-xs font-medium"
        >
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  )
}
