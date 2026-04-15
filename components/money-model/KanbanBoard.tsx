'use client'

import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, GripVertical, Calendar, Zap } from 'lucide-react'
import { OFFER_TYPES, OFFER_TYPE_LABELS, OFFER_TYPE_DESCRIPTIONS } from '@/types/offer'
import type { Offer, OfferType } from '@/types/offer'
import { OfferDrawer } from './OfferDrawer'

export function KanbanBoard({ initialOffers }: { initialOffers: Offer[] }) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Offer | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const columns = useMemo(() => {
    const map: Record<OfferType, Offer[]> = {
      attraction: [],
      core: [],
      upsell: [],
      downsell: [],
      continuity: [],
    }
    for (const o of offers) map[o.offer_type].push(o)
    for (const t of OFFER_TYPES) map[t].sort((a, b) => a.sort_order - b.sort_order)
    return map
  }, [offers])

  const activeOffer = activeId ? offers.find((o) => o.id === activeId) ?? null : null

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return

    const activeOffer = offers.find((o) => o.id === String(active.id))
    if (!activeOffer) return

    const overId = String(over.id)
    const overIsSection = (OFFER_TYPES as readonly string[]).includes(overId)
    const overOffer = overIsSection ? null : offers.find((o) => o.id === overId)

    const targetType: OfferType = overIsSection
      ? (overId as OfferType)
      : overOffer?.offer_type ?? activeOffer.offer_type

    const destList = columns[targetType].filter((o) => o.id !== activeOffer.id)
    const insertIndex = overOffer ? destList.findIndex((o) => o.id === overOffer.id) : destList.length
    destList.splice(insertIndex < 0 ? destList.length : insertIndex, 0, {
      ...activeOffer,
      offer_type: targetType,
    })

    const updated: Offer[] = []
    for (const t of OFFER_TYPES) {
      const list = t === targetType ? destList : columns[t].filter((o) => o.id !== activeOffer.id)
      list.forEach((o, i) => updated.push({ ...o, offer_type: t, sort_order: i }))
    }
    setOffers(updated)

    const moved = updated.find((o) => o.id === activeOffer.id)
    if (moved && (moved.offer_type !== activeOffer.offer_type || moved.sort_order !== activeOffer.sort_order)) {
      await fetch(`/api/offers/${moved.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_type: moved.offer_type, sort_order: moved.sort_order }),
      })
    }
  }

  async function handleCreate(type: OfferType) {
    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New offer',
        offer_type: type,
        sort_order: columns[type].length,
      }),
    })
    if (!res.ok) return
    const { offer } = await res.json()
    setOffers((prev) => [...prev, offer as Offer])
    setEditing(offer as Offer)
  }

  function handleSave(updated: Offer) {
    setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    setEditing(null)
  }

  function handleDelete(id: string) {
    setOffers((prev) => prev.filter((o) => o.id !== id))
    setEditing(null)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-5">
          {OFFER_TYPES.map((type) => (
            <Section
              key={type}
              type={type}
              offers={columns[type]}
              onAdd={() => handleCreate(type)}
              onEdit={setEditing}
            />
          ))}
        </div>

        <DragOverlay>{activeOffer ? <OfferCardView offer={activeOffer} dragging /> : null}</DragOverlay>
      </DndContext>

      {editing && (
        <OfferDrawer
          offer={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSave}
          onDeleted={handleDelete}
        />
      )}
    </>
  )
}

function Section({
  type,
  offers,
  onAdd,
  onEdit,
}: {
  type: OfferType
  offers: Offer[]
  onAdd: () => void
  onEdit: (o: Offer) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: type })

  return (
    <section
      ref={setNodeRef}
      className={`bg-white border rounded-[25px] p-5 transition-colors ${
        isOver ? 'border-brand-gradient-end' : 'border-gray-200'
      }`}
    >
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
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-gradient-end transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" /> Add offer
        </button>
      </header>

      <SortableContext items={offers.map((o) => o.id)} strategy={rectSortingStrategy}>
        {offers.length === 0 ? (
          <div className="text-xs text-gray-400 italic py-6 text-center border border-dashed border-gray-200 rounded-xl">
            No offers here yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {offers.map((o) => (
              <SortableOfferCard key={o.id} offer={o} onClick={() => onEdit(o)} />
            ))}
          </div>
        )}
      </SortableContext>
    </section>
  )
}

function SortableOfferCard({ offer, onClick }: { offer: Offer; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: offer.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <OfferCardView offer={offer} onClick={onClick} dragHandleProps={listeners} />
    </div>
  )
}

function OfferCardView({
  offer,
  onClick,
  dragging,
  dragHandleProps,
}: {
  offer: Offer
  onClick?: () => void
  dragging?: boolean
  dragHandleProps?: Record<string, unknown>
}) {
  return (
    <div
      className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 transition-shadow h-full ${
        dragging ? 'shadow-elevated border-brand-gradient-end' : 'border-gray-200 hover:shadow-card-soft hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          {...(dragHandleProps ?? {})}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none mt-1 flex-shrink-0"
          aria-label="Drag"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button onClick={onClick} className="flex-1 min-w-0 text-left">
          <div className="font-bold text-gray-900 text-base leading-snug">{offer.name}</div>
          {offer.price && (
            <div className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white text-xs font-bold">
              {offer.price}
            </div>
          )}
        </button>
      </div>

      {offer.what_customer_gets && (
        <button onClick={onClick} className="text-left">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{offer.what_customer_gets}</p>
        </button>
      )}

      {(offer.when_offered || offer.trigger) && (
        <button onClick={onClick} className="text-left space-y-1.5 mt-auto pt-2 border-t border-gray-100">
          {offer.when_offered && (
            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" />
              <span className="truncate"><span className="font-semibold text-gray-600">When:</span> {offer.when_offered}</span>
            </div>
          )}
          {offer.trigger && (
            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <Zap className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" />
              <span className="truncate"><span className="font-semibold text-gray-600">Trigger:</span> {offer.trigger}</span>
            </div>
          )}
        </button>
      )}
    </div>
  )
}
