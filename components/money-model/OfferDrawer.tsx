'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Trash2, ExternalLink, Save, ShieldCheck, Check } from 'lucide-react'
import { OFFER_TYPES, OFFER_TYPE_LABELS } from '@/types/offer'
import type { Offer, OfferType } from '@/types/offer'

type FormState = {
  name: string
  offer_type: OfferType
  price: string
  what_customer_gets: string
  why_do_it: string
  when_offered: string
  trigger: string
  sales_pitch: string
}

function toForm(offer: Offer): FormState {
  return {
    name: offer.name ?? '',
    offer_type: offer.offer_type,
    price: offer.price ?? '',
    what_customer_gets: offer.what_customer_gets ?? '',
    why_do_it: offer.why_do_it ?? '',
    when_offered: offer.when_offered ?? '',
    trigger: offer.trigger ?? '',
    sales_pitch: offer.sales_pitch ?? '',
  }
}

export function OfferDrawer({
  offer,
  onClose,
  onSaved,
  onDeleted,
  onAccepted,
}: {
  offer: Offer
  onClose: () => void
  onSaved: (updated: Offer) => void
  onDeleted: (id: string) => void
  onAccepted?: (id: string) => void
}) {
  const [form, setForm] = useState<FormState>(toForm(offer))
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setForm(toForm(offer))
    setDirty(false)
  }, [offer])

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onClose])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: form.price || null,
          what_customer_gets: form.what_customer_gets || null,
          why_do_it: form.why_do_it || null,
          when_offered: form.when_offered || null,
          trigger: form.trigger || null,
          sales_pitch: form.sales_pitch || null,
        }),
      })
      if (!res.ok) return
      const { offer: updated } = await res.json()
      onSaved(updated as Offer)
    } finally {
      setSaving(false)
    }
  }

  async function del() {
    if (!confirm('Delete this offer?')) return
    const res = await fetch(`/api/offers/${offer.id}`, { method: 'DELETE' })
    if (res.ok) onDeleted(offer.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <header className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <h2 className="font-bold text-gray-900">Edit offer</h2>
            {offer.source === 'crucible_ai' && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Crucible Approved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/money-model/classroom/${offer.id}`}
              className="text-xs text-gray-500 hover:text-brand-gradient-end flex items-center gap-1"
            >
              Classroom view <ExternalLink className="w-3 h-3" />
            </Link>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 px-6 py-5 space-y-4">
          <Field label="Offer name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </Field>

          <Field label="Offer type">
            <select
              className="input"
              value={form.offer_type}
              onChange={(e) => update('offer_type', e.target.value as OfferType)}
            >
              {OFFER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {OFFER_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="What the customer gets">
            <textarea
              className="input min-h-[80px]"
              value={form.what_customer_gets}
              onChange={(e) => update('what_customer_gets', e.target.value)}
            />
          </Field>

          <Field label="Why they should do it">
            <textarea
              className="input min-h-[60px]"
              value={form.why_do_it}
              onChange={(e) => update('why_do_it', e.target.value)}
            />
          </Field>

          <Field label="How much does it cost">
            <input
              className="input"
              placeholder="e.g. $499 one-time, $99/mo, Free"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
            />
          </Field>

          <Field label="When should it be offered">
            <textarea
              className="input min-h-[60px]"
              value={form.when_offered}
              onChange={(e) => update('when_offered', e.target.value)}
            />
          </Field>

          <Field label="What triggers the need to offer it">
            <textarea
              className="input min-h-[60px]"
              value={form.trigger}
              onChange={(e) => update('trigger', e.target.value)}
            />
          </Field>

          <Field label="What should I say to sell it">
            <textarea
              className="input min-h-[80px]"
              value={form.sales_pitch}
              onChange={(e) => update('sales_pitch', e.target.value)}
            />
          </Field>
        </div>

        <footer className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={del}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <div className="flex items-center gap-2">
            {offer.source === 'crucible_ai' && onAccepted && (
              <button
                onClick={() => onAccepted(offer.id)}
                className="text-sm px-4 py-2 rounded-xl font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" /> Accept Offer
              </button>
            )}
            <button
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="btn-gradient text-sm px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </footer>
      </aside>
      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #111827;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: #ff8800;
          box-shadow: 0 0 0 3px rgba(255, 136, 0, 0.15);
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
