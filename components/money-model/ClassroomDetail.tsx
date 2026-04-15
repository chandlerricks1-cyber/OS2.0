'use client'

import { useState } from 'react'
import { Pencil, Save, X } from 'lucide-react'
import { TipTapEditor } from './TipTapEditor'
import { toEmbedUrl } from '@/lib/video/embed'
import { OFFER_TYPE_LABELS } from '@/types/offer'
import type { Offer } from '@/types/offer'

export function ClassroomDetail({ offer: initialOffer }: { offer: Offer }) {
  const [offer, setOffer] = useState<Offer>(initialOffer)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: initialOffer.name ?? '',
    short_description: initialOffer.short_description ?? '',
    thumbnail_url: initialOffer.thumbnail_url ?? '',
    video_url: initialOffer.video_url ?? '',
    classroom_body: initialOffer.classroom_body ?? '',
  })

  const embed = toEmbedUrl(offer.video_url)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || offer.name,
          short_description: form.short_description || null,
          thumbnail_url: form.thumbnail_url || null,
          video_url: form.video_url || null,
          classroom_body: form.classroom_body || null,
        }),
      })
      if (!res.ok) return
      const { offer: updated } = await res.json()
      setOffer(updated as Offer)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setForm({
      name: offer.name ?? '',
      short_description: offer.short_description ?? '',
      thumbnail_url: offer.thumbnail_url ?? '',
      video_url: offer.video_url ?? '',
      classroom_body: offer.classroom_body ?? '',
    })
    setEditing(false)
  }

  return (
    <article className="bg-white border border-gray-200 rounded-[25px] p-6 md:p-10">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wide text-brand-gradient-end mb-2">
            {OFFER_TYPE_LABELS[offer.offer_type]}
          </div>
          {editing ? (
            <input
              className="w-full text-3xl md:text-4xl font-black text-gray-900 border-b border-gray-200 focus:border-brand-gradient-end outline-none pb-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          ) : (
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{offer.name}</h1>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {editing ? (
            <>
              <button
                onClick={cancel}
                className="text-sm px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100 flex items-center gap-1.5"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="btn-gradient text-sm px-3 py-2 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-sm px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100 flex items-center gap-1.5"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <input
          className="w-full text-gray-500 border-b border-gray-200 focus:border-brand-gradient-end outline-none pb-1 mb-6"
          placeholder="Short description shown on the classroom card"
          value={form.short_description}
          onChange={(e) => setForm({ ...form, short_description: e.target.value })}
        />
      ) : offer.short_description ? (
        <p className="text-gray-500 mb-6">{offer.short_description}</p>
      ) : null}

      {editing && (
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Video URL (YouTube or Loom)</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-gradient-end outline-none"
              placeholder="https://www.loom.com/share/..."
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            />
            {form.video_url && !toEmbedUrl(form.video_url) && (
              <p className="text-xs text-red-500 mt-1">Paste a YouTube or Loom URL to embed.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Thumbnail image URL</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-gradient-end outline-none"
              placeholder="https://..."
              value={form.thumbnail_url}
              onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            />
          </div>
        </div>
      )}

      {embed && (
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black mb-8">
          <iframe
            src={embed}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {editing ? (
        <TipTapEditor
          value={form.classroom_body}
          onChange={(html) => setForm({ ...form, classroom_body: html })}
        />
      ) : offer.classroom_body ? (
        <TipTapEditor value={offer.classroom_body} onChange={() => {}} editable={false} />
      ) : (
        <div className="text-sm text-gray-400 italic">
          No content yet. Click Edit to add your sales pitch and servicing notes.
        </div>
      )}
    </article>
  )
}
