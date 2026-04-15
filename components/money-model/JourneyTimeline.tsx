'use client'

import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2, Pencil, GripVertical, Check, X, Calendar, Zap } from 'lucide-react'
import { OFFER_TYPE_LABELS } from '@/types/offer'
import type { Offer, Milestone, MilestoneOffer } from '@/types/offer'

type Link = MilestoneOffer

// Visual layout constants for the connector rail
const RAIL_WIDTH = 48 // total gutter on left containing the connector
const RAIL_CENTER = 24 // x-position of the vertical line within the gutter
const BADGE_SIZE = 36 // circular number badge

export function JourneyTimeline({
  initialOffers,
  initialMilestones,
  initialLinks,
}: {
  initialOffers: Offer[]
  initialMilestones: Milestone[]
  initialLinks: Link[]
}) {
  const offers = initialOffers
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones)
  const [links, setLinks] = useState<Link[]>(initialLinks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [picker, setPicker] = useState<string | null>(null)
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const offersById = useMemo(() => {
    const m = new Map<string, Offer>()
    offers.forEach((o) => m.set(o.id, o))
    return m
  }, [offers])

  const linksByMilestone = useMemo(() => {
    const map = new Map<string, Link[]>()
    for (const m of milestones) map.set(m.id, [])
    for (const link of links) {
      const arr = map.get(link.milestone_id)
      if (arr) arr.push(link)
    }
    map.forEach((arr) => arr.sort((a: Link, b: Link) => a.sequence - b.sequence))
    return map
  }, [milestones, links])

  async function addMilestone() {
    const res = await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New milestone', sort_order: milestones.length }),
    })
    if (!res.ok) return
    const { milestone } = await res.json()
    setMilestones((prev) => [...prev, milestone as Milestone])
    setEditingMilestone((milestone as Milestone).id)
  }

  async function updateMilestone(id: string, patch: Partial<Pick<Milestone, 'name' | 'description'>>) {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
    await fetch(`/api/milestones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  }

  async function deleteMilestone(id: string) {
    if (!confirm('Delete this milestone and all its offer links?')) return
    setMilestones((prev) => prev.filter((m) => m.id !== id))
    setLinks((prev) => prev.filter((l) => l.milestone_id !== id))
    await fetch(`/api/milestones/${id}`, { method: 'DELETE' })
  }

  async function attachOffer(milestoneId: string, offerId: string) {
    const existing = linksByMilestone.get(milestoneId) ?? []
    if (existing.some((l) => l.offer_id === offerId)) {
      setPicker(null)
      return
    }
    const sequence = existing.length
    setLinks((prev) => [...prev, { milestone_id: milestoneId, offer_id: offerId, sequence }])
    setPicker(null)
    await fetch(`/api/milestones/${milestoneId}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offer_id: offerId, sequence }),
    })
  }

  async function detachOffer(milestoneId: string, offerId: string) {
    setLinks((prev) => prev.filter((l) => !(l.milestone_id === milestoneId && l.offer_id === offerId)))
    await fetch(`/api/milestones/${milestoneId}/offers/${offerId}`, { method: 'DELETE' })
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return

    const [kind, aMilestoneId, aOfferId] = String(active.id).split(':')
    if (kind !== 'link') return

    const overId = String(over.id)
    const overIsMilestone = overId.startsWith('milestone:')
    const overMilestoneId = overIsMilestone ? overId.slice('milestone:'.length) : overId.split(':')[1]
    if (!overMilestoneId) return

    const destList = [...(linksByMilestone.get(overMilestoneId) ?? [])]
    const moving = links.find((l) => l.milestone_id === aMilestoneId && l.offer_id === aOfferId)
    if (!moving) return

    const withoutMoving = destList.filter(
      (l) => !(l.milestone_id === aMilestoneId && l.offer_id === aOfferId)
    )
    const overOffer = overIsMilestone
      ? null
      : withoutMoving.find((l) => l.offer_id === overId.split(':')[2])
    const insertIdx = overOffer
      ? withoutMoving.findIndex((l) => l.offer_id === overOffer.offer_id)
      : withoutMoving.length
    withoutMoving.splice(insertIdx, 0, { ...moving, milestone_id: overMilestoneId })

    const resequenced = withoutMoving.map((l, i) => ({ ...l, sequence: i }))

    setLinks((prev) => {
      const others = prev.filter((l) => !(l.milestone_id === aMilestoneId && l.offer_id === aOfferId))
      const withoutDest = others.filter((l) => l.milestone_id !== overMilestoneId)
      return [...withoutDest, ...resequenced]
    })

    const movedFromAnother = aMilestoneId !== overMilestoneId
    if (movedFromAnother) {
      await fetch(`/api/milestones/${aMilestoneId}/offers/${aOfferId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestone_id: overMilestoneId,
          sequence: resequenced.find((l) => l.offer_id === aOfferId)?.sequence ?? 0,
        }),
      })
    }
    for (const link of resequenced) {
      if (movedFromAnother && link.offer_id === aOfferId) continue
      await fetch(`/api/milestones/${overMilestoneId}/offers/${link.offer_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: link.sequence }),
      })
    }
  }

  const activeLink = activeId?.startsWith('link:')
    ? (() => {
        const [, mId, oId] = activeId.split(':')
        const offer = offersById.get(oId)
        return offer ? { offer, milestoneId: mId } : null
      })()
    : null

  if (milestones.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-[25px] p-12 text-center">
        <div className="text-sm font-semibold text-gray-600 mb-2">No milestones yet</div>
        <div className="text-xs text-gray-500 mb-4">
          A milestone is a trigger or event in the customer journey where at least one offer is presented.
        </div>
        <button onClick={addMilestone} className="btn-gradient text-sm px-4 py-2 inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add first milestone
        </button>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative">
        {/* Connector rail: single svg overlay spanning the full stack */}
        <ConnectorRail count={milestones.length} />

        <div className="flex flex-col gap-5">
          {milestones.map((m, idx) => (
            <MilestoneRow
              key={m.id}
              milestone={m}
              index={idx + 1}
              links={linksByMilestone.get(m.id) ?? []}
              offersById={offersById}
              availableOffers={offers.filter(
                (o) => !(linksByMilestone.get(m.id) ?? []).some((l) => l.offer_id === o.id)
              )}
              pickerOpen={picker === m.id}
              onPickerToggle={() => setPicker(picker === m.id ? null : m.id)}
              editing={editingMilestone === m.id}
              onEditToggle={() => setEditingMilestone(editingMilestone === m.id ? null : m.id)}
              onAttach={(offerId) => attachOffer(m.id, offerId)}
              onDetach={(offerId) => detachOffer(m.id, offerId)}
              onUpdate={(patch) => updateMilestone(m.id, patch)}
              onDelete={() => deleteMilestone(m.id)}
            />
          ))}

          <div className="pl-[72px]">
            <button
              onClick={addMilestone}
              className="w-full border-2 border-dashed border-gray-300 rounded-[20px] text-gray-500 hover:border-brand-gradient-end hover:text-brand-gradient-end transition-colors flex items-center justify-center gap-2 py-4"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add milestone</span>
            </button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeLink ? <OfferChip offer={activeLink.offer} sequence={0} dragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}

function ConnectorRail({ count }: { count: number }) {
  // The rail visually connects milestone badges. Since milestone cards can vary in height,
  // we draw a continuous faint vertical line across the rail. The rounded-elbow effect is
  // provided by the badge caps (circles) that sit on top of the line.
  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{ left: 0, width: RAIL_WIDTH }}
      aria-hidden
    >
      <svg width={RAIL_WIDTH} height="100%" preserveAspectRatio="none" className="absolute inset-0">
        <defs>
          <linearGradient id="rail-gradient" x1="0" y1="0" x2="0" y2="1">
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
            stroke="url(#rail-gradient)"
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
  availableOffers,
  pickerOpen,
  onPickerToggle,
  editing,
  onEditToggle,
  onAttach,
  onDetach,
  onUpdate,
  onDelete,
}: {
  milestone: Milestone
  index: number
  links: Link[]
  offersById: Map<string, Offer>
  availableOffers: Offer[]
  pickerOpen: boolean
  onPickerToggle: () => void
  editing: boolean
  onEditToggle: () => void
  onAttach: (offerId: string) => void
  onDetach: (offerId: string) => void
  onUpdate: (patch: Partial<Pick<Milestone, 'name' | 'description'>>) => void
  onDelete: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `milestone:${milestone.id}` })
  const [name, setName] = useState(milestone.name)
  const [description, setDescription] = useState(milestone.description ?? '')

  return (
    <div className="relative flex gap-5">
      {/* Left rail with number badge */}
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

      {/* Milestone card */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-white border rounded-[20px] p-5 flex flex-col gap-4 transition-colors ${
          isOver ? 'border-brand-gradient-end shadow-card-soft' : 'border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wide text-brand-gradient-end mb-1">
              Milestone {index}
            </div>
            {editing ? (
              <input
                autoFocus
                className="w-full text-lg font-bold text-gray-900 border-b border-gray-200 focus:border-brand-gradient-end outline-none py-0.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              <div className="text-lg font-bold text-gray-900">{milestone.name}</div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    onUpdate({ name, description: description || null })
                    onEditToggle()
                  }}
                  className="text-green-600 hover:text-green-700 p-1"
                  aria-label="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setName(milestone.name)
                    setDescription(milestone.description ?? '')
                    onEditToggle()
                  }}
                  className="text-gray-400 hover:text-gray-700 p-1"
                  aria-label="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={onEditToggle} className="text-gray-400 hover:text-gray-700 p-1" aria-label="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={onDelete} className="text-gray-400 hover:text-red-600 p-1" aria-label="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <textarea
            className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg p-2 focus:border-brand-gradient-end outline-none"
            placeholder="What triggers this milestone?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        ) : milestone.description ? (
          <div className="text-sm text-gray-500">{milestone.description}</div>
        ) : null}

        <SortableContext
          items={links.map((l) => `link:${l.milestone_id}:${l.offer_id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {links.map((link, i) => {
              const offer = offersById.get(link.offer_id)
              if (!offer) return null
              return (
                <SortableLink
                  key={`${link.milestone_id}:${link.offer_id}`}
                  milestoneId={link.milestone_id}
                  offer={offer}
                  sequence={i + 1}
                  onDetach={() => onDetach(link.offer_id)}
                />
              )
            })}
            {links.length === 0 && (
              <div className="text-xs text-gray-400 italic text-center py-3 border border-dashed border-gray-200 rounded-xl">
                No offers attached yet
              </div>
            )}
          </div>
        </SortableContext>

        {pickerOpen ? (
          <div className="border border-gray-200 rounded-xl p-2 bg-gray-50">
            <div className="text-xs font-semibold text-gray-700 mb-1.5 px-1">Attach an offer</div>
            {availableOffers.length === 0 ? (
              <div className="text-xs text-gray-400 px-1 py-2">All offers already attached.</div>
            ) : (
              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
                {availableOffers.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => onAttach(o.id)}
                    className="text-left text-sm px-2 py-2 rounded-lg hover:bg-white text-gray-700 flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{o.name}</span>
                    <span className="text-[9px] uppercase text-gray-400 flex-shrink-0">
                      {OFFER_TYPE_LABELS[o.offer_type]}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={onPickerToggle}
              className="w-full text-xs text-gray-500 hover:text-gray-700 mt-2 py-1"
            >
              Close
            </button>
          </div>
        ) : (
          <button
            onClick={onPickerToggle}
            className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-brand-gradient-end transition-colors py-2 border border-dashed border-gray-300 rounded-xl hover:border-brand-gradient-end"
          >
            <Plus className="w-4 h-4" /> Attach offer
          </button>
        )}
      </div>
    </div>
  )
}

function SortableLink({
  milestoneId,
  offer,
  sequence,
  onDetach,
}: {
  milestoneId: string
  offer: Offer
  sequence: number
  onDetach: () => void
}) {
  const id = `link:${milestoneId}:${offer.id}`
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <OfferChip offer={offer} sequence={sequence} dragHandleProps={listeners} onDetach={onDetach} />
    </div>
  )
}

function OfferChip({
  offer,
  sequence,
  dragging,
  dragHandleProps,
  onDetach,
}: {
  offer: Offer
  sequence: number
  dragging?: boolean
  dragHandleProps?: Record<string, unknown>
  onDetach?: () => void
}) {
  return (
    <div
      className={`bg-white border rounded-xl p-3 flex items-start gap-3 ${
        dragging ? 'shadow-elevated border-brand-gradient-end' : 'border-gray-200'
      }`}
    >
      {dragHandleProps && (
        <button
          {...dragHandleProps}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none mt-0.5"
          aria-label="Drag"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
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
      {onDetach && (
        <button
          onClick={onDetach}
          className="text-gray-300 hover:text-red-600 flex-shrink-0 mt-0.5"
          aria-label="Detach"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
