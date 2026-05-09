import { Calendar, Zap } from 'lucide-react'
import { OFFER_TYPE_LABELS } from '@/types/offer'
import type { Offer, Milestone, MilestoneOffer } from '@/types/offer'

const RAIL_WIDTH = 48
const RAIL_CENTER = 24
const BADGE_SIZE = 36

export function PublicJourneyTimeline({
  offers,
  milestones,
  links,
}: {
  offers: Offer[]
  milestones: Milestone[]
  links: MilestoneOffer[]
}) {
  if (milestones.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-[25px] p-12 text-center">
        <div className="text-sm font-semibold text-gray-600 mb-2">No customer journey defined yet</div>
        <div className="text-xs text-gray-500">
          Milestones map the moments when offers are presented across the customer journey.
        </div>
      </div>
    )
  }

  const offersById = new Map<string, Offer>()
  offers.forEach((o) => offersById.set(o.id, o))

  const linksByMilestone = new Map<string, MilestoneOffer[]>()
  for (const m of milestones) linksByMilestone.set(m.id, [])
  for (const link of links) {
    const arr = linksByMilestone.get(link.milestone_id)
    if (arr) arr.push(link)
  }
  linksByMilestone.forEach((arr) => arr.sort((a, b) => a.sequence - b.sequence))

  return (
    <div className="relative">
      <ConnectorRail count={milestones.length} />

      <div className="flex flex-col gap-5">
        {milestones.map((m, idx) => (
          <MilestoneRow
            key={m.id}
            milestone={m}
            index={idx + 1}
            links={linksByMilestone.get(m.id) ?? []}
            offersById={offersById}
          />
        ))}
      </div>
    </div>
  )
}

function ConnectorRail({ count }: { count: number }) {
  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{ left: 0, width: RAIL_WIDTH }}
      aria-hidden
    >
      <svg width={RAIL_WIDTH} height="100%" preserveAspectRatio="none" className="absolute inset-0">
        <defs>
          <linearGradient id="rail-gradient-public" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8800" stopOpacity="0.05" />
            <stop offset="10%" stopColor="#ff8800" stopOpacity="0.35" />
            <stop offset="90%" stopColor="#ff8800" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff8800" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {count > 1 && (
          <line
            x1={RAIL_CENTER}
            y1="0"
            x2={RAIL_CENTER}
            y2="100%"
            stroke="url(#rail-gradient-public)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  )
}

function MilestoneRow({
  milestone,
  index,
  links,
  offersById,
}: {
  milestone: Milestone
  index: number
  links: MilestoneOffer[]
  offersById: Map<string, Offer>
}) {
  return (
    <div className="relative flex gap-5">
      <div className="flex-shrink-0 relative" style={{ width: RAIL_WIDTH }}>
        <div
          className="absolute rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end text-white font-bold flex items-center justify-center shadow-[0_4px_14px_rgba(255,136,0,0.35)] ring-4 ring-brand-cream"
          style={{
            width: BADGE_SIZE,
            height: BADGE_SIZE,
            top: 16,
            left: RAIL_CENTER - BADGE_SIZE / 2,
            fontSize: 14,
          }}
        >
          {index}
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-[20px] p-5 flex flex-col gap-4">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wide text-brand-gradient-end mb-1">
            Milestone {index}
          </div>
          <div className="text-lg font-bold text-gray-900">{milestone.name}</div>
          {milestone.description && (
            <div className="text-sm text-gray-500 mt-1">{milestone.description}</div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {links.length === 0 ? (
            <div className="text-xs text-gray-400 italic text-center py-3 border border-dashed border-gray-200 rounded-xl">
              No offers attached at this milestone
            </div>
          ) : (
            links.map((link, i) => {
              const offer = offersById.get(link.offer_id)
              if (!offer) return null
              return <OfferChip key={`${link.milestone_id}:${link.offer_id}`} offer={offer} sequence={i + 1} />
            })
          )}
        </div>
      </div>
    </div>
  )
}

function OfferChip({ offer, sequence }: { offer: Offer; sequence: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {sequence || '—'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm font-bold text-gray-900">{offer.name}</div>
          <span className="text-[9px] uppercase tracking-wide text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
            {OFFER_TYPE_LABELS[offer.offer_type]}
          </span>
          {offer.price && (
            <span className="text-xs font-bold text-brand-gradient-end">{offer.price}</span>
          )}
        </div>
        {offer.what_customer_gets && (
          <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{offer.what_customer_gets}</div>
        )}
        {(offer.when_offered || offer.trigger) && (
          <div className="flex flex-wrap gap-3 mt-1.5">
            {offer.when_offered && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                <Calendar className="w-3 h-3 text-gray-400" /> {offer.when_offered}
              </span>
            )}
            {offer.trigger && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                <Zap className="w-3 h-3 text-gray-400" /> {offer.trigger}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
