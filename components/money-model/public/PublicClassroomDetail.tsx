'use client'

import { TipTapEditor } from '../TipTapEditor'
import { toEmbedUrl } from '@/lib/video/embed'
import { OFFER_TYPE_LABELS } from '@/types/offer'
import type { Offer } from '@/types/offer'

const TRAINING_FIELDS: { key: keyof Offer; label: string }[] = [
  { key: 'sales_pitch', label: 'Sales pitch' },
  { key: 'why_do_it', label: 'Why we offer it' },
  { key: 'when_offered', label: 'When to offer it' },
  { key: 'trigger', label: 'Trigger' },
]

export function PublicClassroomDetail({ offer }: { offer: Offer }) {
  const embed = toEmbedUrl(offer.video_url)
  const trainingItems = TRAINING_FIELDS.map((f) => ({
    label: f.label,
    value: typeof offer[f.key] === 'string' ? (offer[f.key] as string) : null,
  })).filter((f) => f.value && f.value.trim().length > 0)

  return (
    <article className="bg-white border border-gray-200 rounded-[25px] p-6 md:p-10">
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-brand-gradient-end mb-2">
          {OFFER_TYPE_LABELS[offer.offer_type]}
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{offer.name}</h1>
        {offer.price && (
          <div className="inline-flex items-center mt-3 px-3 py-1 rounded-full bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white text-sm font-bold">
            {offer.price}
          </div>
        )}
      </div>

      {offer.short_description && (
        <p className="text-gray-500 mb-6">{offer.short_description}</p>
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

      {offer.classroom_body ? (
        <TipTapEditor value={offer.classroom_body} onChange={() => {}} editable={false} />
      ) : null}

      {offer.what_customer_gets && (
        <section className="mt-8 pt-6 border-t border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">What the customer gets</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{offer.what_customer_gets}</p>
        </section>
      )}

      {trainingItems.length > 0 && (
        <section className="mt-8 pt-6 border-t border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-4">Training notes</h2>
          <dl className="grid sm:grid-cols-2 gap-5">
            {trainingItems.map((item) => (
              <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-brand-gradient-end mb-1.5">
                  {item.label}
                </dt>
                <dd className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </article>
  )
}
