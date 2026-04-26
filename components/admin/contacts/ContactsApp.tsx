'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, Plus, Loader2, X } from 'lucide-react'

interface Contact {
  ghl_id: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  tags: string[] | null
  source: string | null
  date_added: string | null
  synced_at: string
}

export function ContactsApp() {
  const [items, setItems] = useState<Contact[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const inFlight = useRef(false)

  const fetchPage = useCallback(async (reset = false) => {
    if (inFlight.current) return
    inFlight.current = true
    setLoading(true)
    try {
      const sp = new URLSearchParams()
      if (q.trim()) sp.set('q', q.trim())
      if (!reset && cursor) sp.set('cursor', cursor)
      const res = await fetch(`/api/admin/contacts?${sp.toString()}`)
      const data = (await res.json()) as { items: Contact[]; nextCursor: string | null; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'load failed')
      setItems((prev) => (reset ? data.items : [...prev, ...data.items]))
      setCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      inFlight.current = false
    }
  }, [q, cursor])

  // Initial load + reload when search changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      setItems([])
      setCursor(null)
      setHasMore(true)
      fetchPage(true)
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const totalShown = items.length

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gradient-end/30 focus:border-brand-gradient-end"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-gradient px-4 py-2.5 inline-flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> New Contact
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {items.length === 0 && !loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            {q ? 'No contacts match your search.' : 'No contacts yet — run the GHL backfill in Integrations.'}
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Source</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tags</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Added</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((c) => (
                    <ContactRow key={c.ghl_id} c={c} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {items.map((c) => (
                <Link
                  key={c.ghl_id}
                  href={`/dashboard/admin/contacts/${c.ghl_id}`}
                  className="block px-4 py-3 active:bg-gray-50"
                >
                  <p className="font-medium text-gray-900 truncate">{displayName(c)}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{c.email ?? c.phone ?? '—'}</p>
                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.tags.slice(0, 3).map((t) => (
                        <span key={t} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                      {c.tags.length > 3 && <span className="text-xs text-gray-400">+{c.tags.length - 3}</span>}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}

        {(loading || hasMore) && items.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <button
                onClick={() => fetchPage(false)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Showing {totalShown} contact{totalShown === 1 ? '' : 's'}
        {hasMore && ' · more available'}
      </p>

      {showCreate && (
        <CreateContactDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            setItems([])
            setCursor(null)
            setHasMore(true)
            fetchPage(true)
          }}
        />
      )}
    </>
  )
}

function displayName(c: Contact): string {
  return (
    c.full_name ||
    [c.first_name, c.last_name].filter(Boolean).join(' ').trim() ||
    c.email ||
    c.phone ||
    '(no name)'
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function ContactRow({ c }: { c: Contact }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3">
        <Link href={`/dashboard/admin/contacts/${c.ghl_id}`} className="font-medium text-gray-900 hover:text-brand-gradient-end">
          {displayName(c)}
        </Link>
      </td>
      <td className="px-5 py-3 text-gray-700">{c.email ?? '—'}</td>
      <td className="px-5 py-3 text-gray-700">{c.phone ?? '—'}</td>
      <td className="px-5 py-3 text-gray-500 text-xs">{c.source ?? '—'}</td>
      <td className="px-5 py-3">
        <div className="flex flex-wrap gap-1">
          {(c.tags ?? []).slice(0, 3).map((t) => (
            <span key={t} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
          {(c.tags?.length ?? 0) > 3 && <span className="text-xs text-gray-400">+{(c.tags?.length ?? 0) - 3}</span>}
        </div>
      </td>
      <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(c.date_added)}</td>
      <td className="px-5 py-3 text-right">
        <Link
          href={`/dashboard/admin/contacts/${c.ghl_id}`}
          className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          View →
        </Link>
      </td>
    </tr>
  )
}

function CreateContactDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email) {
      setError('Email is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'create failed')
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'create failed')
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
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">New Contact</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" value={firstName} onChange={setFirstName} />
            <Field label="Last name" value={lastName} onChange={setLastName} />
          </div>
          <Field label="Email *" value={email} onChange={setEmail} type="email" required />
          <Field label="Phone" value={phone} onChange={setPhone} type="tel" />
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
              Create
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
  required = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gradient-end/30 focus:border-brand-gradient-end"
      />
    </label>
  )
}
