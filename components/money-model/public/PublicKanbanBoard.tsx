import { Calendar, Zap } from 'lucide-react'
import { OFFER_TYPES, OFFER_TYPE_LABELS, OFFER_TYPE_DESCRIPTIONS } from '@/types/offer'
import type { Offer, OfferType } from '@/types/offer'

export function PublicKanbanBoard({ offers }: { offers: Offer[] }) {
  const columns: Record<OfferType, Offer[]> = {
    attraction: [],
    core: [],
    upsell: [],
    downsell: [],
    continuity: [],
  }
  for (const o of offers) columns[o.offer_type].push(o)
  for (const t of OFFER_TYPES) columns[t].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="flex flex-col gap-5">
      {OFFER_TYPES.map((type) => (
        <Section key={type} type={type} offers={columns[type]} />
      ))}
    </div>
  )
}

function Section({ type, offers }: { type: OfferType; offers: Offer[] }) {
  return (
    <section className="bg-white border border-gray-200 rounded-[25px] p-5">
      <header className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-lg">{OFFER_TYPE_LABELS[type]}</h3>
            <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
              {offers.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{OFFER_TYPE_DESCRIPTIONS[type]}</p>
        </div>
      </header>

      {offers.length === 0 ? (
        <div className="text-xs text-gray-400 italic py-6 text-center border border-dashed border-gray-200 rounded-xl">
          No offers in this column
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {offers.map((o) => (
            <OfferCardView key={o.id} offer={o} />
          ))}
        </div>
      )}
    </section>
  )
}

function OfferCardView({ offer }: { offer: Offer }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 h-full">
      <div className="min-w-0">
        <div className="font-bold text-gray-900 text-base leading-snug">{offer.name}</div>
        {offer.price && (
          <div className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white text-xs font-bold">
            {offer.price}
          </div>
        )}
      </div>

      {offer.what_customer_gets && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{offer.what_customer_gets}</p>
      )}

      {(offer.when_offered || offer.trigger) && (
        <div className="space-y-1.5 mt-auto pt-2 border-t border-gray-100">
          {offer.when_offered && (
            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" />
              <span className="truncate">
                <span className="font-semibold text-gray-600">When:</span> {offer.when_offered}
              </span>
            </div>
          )}
          {offer.trigger && (
            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <Zap className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" />
              <span className="truncate">
                <span className="font-semibold text-gray-600">Trigger:</span> {offer.trigger}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
