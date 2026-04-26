'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Phone, Calendar, Tag, Pencil, Trash2, MapPin, Globe } from 'lucide-react'

interface Contact {
  ghl_id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  email: string | null
  phone: string | null
  tags: string[] | null
  source: string | null
  country: string | null
  timezone: string | null
  custom_fields: unknown
  date_added: string | null
  synced_at: string
}

interface Appointment {
  ghl_id: string
  title: string | null
  start_time: string | null
  end_time: string | null
  appointment_status: string | null
  calendar_id: string | null
}

interface Opportunity {
  ghl_id: string
  name: string | null
  status: string | null
  monetary_value: number | null
  pipeline_id: string | null
  stage_id: string | null
  date_updated: string | null
}

interface Conversation {
  ghl_id: string
  last_message_type: string | null
  last_message_body: string | null
  last_message_at: string | null
  unread_count: number | null
}

type Tab = 'overview' | 'conversations' | 'opportunities' | 'appointments' | 'custom_fields'

export function ContactDetail({
  contact,
  appointments,
  opportunities,
  conversations,
}: {
  contact: Contact
  appointments: Appointment[]
  opportunities: Opportunity[]
  conversations: Conversation[]
}) {
  const [tab, setTab] = useState<Tab>('overview')
  const [editing, setEditing] = useState(false)
  const router = useRouter()

  const fullName =
    contact.full_name ||
    [contact.first_name, contact.last_name].filter(Boolean).join(' ').trim() ||
    contact.email ||
    contact.phone ||
    '(no name)'

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'conversations', label: 'Conversations', count: conversations.length },
    { id: 'opportunities', label: 'Opportunities', count: opportunities.length },
    { id: 'appointments', label: 'Appointments', count: appointments.length },
    { id: 'custom_fields', label: 'Custom Fields' },
  ]

  async function deleteContact() {
    if (!confirm(`Delete ${fullName}? This removes the contact in GoHighLevel as well.`)) return
    const res = await fetch(`/api/admin/contacts/${contact.ghl_id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Delete failed: ${data.error ?? res.statusText}`)
      return
    }
    router.push('/dashboard/admin/contacts')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{fullName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1.5 hover:text-gray-900">
                  <Mail className="w-3.5 h-3.5" /> {contact.email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-1.5 hover:text-gray-900">
                  <Phone className="w-3.5 h-3.5" /> {contact.phone}
                </a>
              )}
              {contact.country && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {contact.country}
                </span>
              )}
              {contact.timezone && (
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> {contact.timezone}
                </span>
              )}
            </div>
            {(contact.tags?.length ?? 0) > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                {(contact.tags ?? []).map((t) => (
                  <span key={t} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={deleteContact}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Stat label="Source" value={contact.source ?? '—'} />
          <Stat label="Added" value={formatDate(contact.date_added)} />
          <Stat label="Last synced" value={formatDate(contact.synced_at)} />
          <Stat label="GHL ID" value={contact.ghl_id} mono />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <nav className="flex items-center gap-1 px-2 pt-2 border-b border-gray-100 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="ml-1.5 text-xs text-gray-400">{t.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-6">
          {tab === 'overview' && <OverviewTab contact={contact} />}
          {tab === 'conversations' && <ConversationsTab items={conversations} />}
          {tab === 'opportunities' && <OpportunitiesTab items={opportunities} />}
          {tab === 'appointments' && <AppointmentsTab items={appointments} />}
          {tab === 'custom_fields' && (
            <CustomFieldsTab
              fields={
                (contact.custom_fields && typeof contact.custom_fields === 'object'
                  ? (contact.custom_fields as Record<string, unknown>)
                  : {})
              }
            />
          )}
        </div>
      </div>

      {editing && (
        <EditContactDialog
          contact={contact}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function Stat({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">{label}</p>
      <p className={`text-gray-800 truncate ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</p>
    </div>
  )
}

function OverviewTab({ contact }: { contact: Contact }) {
  return (
    <div className="text-sm text-gray-600 space-y-2">
      <p>
        Conversations, opportunities, and appointments for this contact will populate as they sync from
        GoHighLevel. Use the tabs above to navigate.
      </p>
      <p className="text-xs text-gray-400">
        Conversation, calendar, and pipeline syncing turn on as later phases ship.
      </p>
    </div>
  )
}

function ConversationsTab({ items }: { items: Conversation[] }) {
  if (items.length === 0) return <Empty hint="No conversations synced yet." />
  return (
    <ul className="divide-y divide-gray-100 -my-2">
      {items.map((c) => (
        <li key={c.ghl_id} className="py-3 flex items-start gap-3">
          <div className="text-xs text-gray-400 w-24 shrink-0">{formatDate(c.last_message_at)}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-800 truncate">{c.last_message_body ?? '—'}</p>
            <p className="text-xs text-gray-500">
              {c.last_message_type ?? 'message'}
              {c.unread_count ? <span className="ml-2 text-amber-600">{c.unread_count} unread</span> : null}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function OpportunitiesTab({ items }: { items: Opportunity[] }) {
  if (items.length === 0) return <Empty hint="No opportunities yet." />
  return (
    <ul className="divide-y divide-gray-100 -my-2">
      {items.map((o) => (
        <li key={o.ghl_id} className="py-3 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900 font-medium truncate">{o.name ?? '(unnamed)'}</p>
            <p className="text-xs text-gray-500">{o.status ?? '—'}</p>
          </div>
          <div className="text-sm text-gray-700 shrink-0">
            {o.monetary_value ? `$${o.monetary_value.toLocaleString()}` : '—'}
          </div>
        </li>
      ))}
    </ul>
  )
}

function AppointmentsTab({ items }: { items: Appointment[] }) {
  if (items.length === 0) return <Empty hint="No appointments yet." />
  return (
    <ul className="divide-y divide-gray-100 -my-2">
      {items.map((a) => (
        <li key={a.ghl_id} className="py-3 flex items-start gap-3">
          <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900 truncate">{a.title ?? '(no title)'}</p>
            <p className="text-xs text-gray-500">
              {formatDateTime(a.start_time)}
              {a.appointment_status ? ` · ${a.appointment_status}` : ''}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function CustomFieldsTab({ fields }: { fields: Record<string, unknown> }) {
  const entries = Object.entries(fields)
  if (entries.length === 0) return <Empty hint="No custom field values." />
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {entries.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs text-gray-400 uppercase tracking-wide">{k}</dt>
          <dd className="text-sm text-gray-800 break-words">{String(v ?? '')}</dd>
        </div>
      ))}
    </dl>
  )
}

function Empty({ hint }: { hint: string }) {
  return <p className="text-sm text-gray-500">{hint}</p>
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function EditContactDialog({
  contact,
  onClose,
  onSaved,
}: {
  contact: Contact
  onClose: () => void
  onSaved: () => void
}) {
  const [firstName, setFirstName] = useState(contact.first_name ?? '')
  const [lastName, setLastName] = useState(contact.last_name ?? '')
  const [email, setEmail] = useState(contact.email ?? '')
  const [phone, setPhone] = useState(contact.phone ?? '')
  const [tagsInput, setTagsInput] = useState((contact.tags ?? []).join(', '))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const res = await fetch(`/api/admin/contacts/${contact.ghl_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, tags }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'save failed')
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Contact</h2>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" value={firstName} onChange={setFirstName} />
            <Field label="Last name" value={lastName} onChange={setLastName} />
          </div>
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Phone" value={phone} onChange={setPhone} type="tel" />
          <Field label="Tags (comma-separated)" value={tagsInput} onChange={setTagsInput} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-gradient px-4 py-2 text-sm inline-flex items-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gradient-end/30 focus:border-brand-gradient-end"
      />
    </label>
  )
}
