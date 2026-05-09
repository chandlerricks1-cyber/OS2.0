'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PublicKanbanBoard } from './PublicKanbanBoard'
import { PublicJourneyTimeline } from './PublicJourneyTimeline'
import { PublicClassroomGrid } from './PublicClassroomGrid'
import type { Offer, Milestone, MilestoneOffer } from '@/types/offer'

type Tab = 'overview' | 'journey' | 'classroom'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'journey', label: 'Customer Journey' },
  { id: 'classroom', label: 'Classroom' },
]

export function PublicMoneyModelTabs({
  initialTab,
  basePath,
  offers,
  milestones,
  links,
}: {
  initialTab: Tab
  basePath: string
  offers: Offer[]
  milestones: Milestone[]
  links: MilestoneOffer[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>(initialTab)

  function go(next: Tab) {
    setTab(next)
    const qs = next === 'overview' ? '' : `?tab=${next}`
    router.replace(`${basePath}${qs}`, { scroll: false })
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => go(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-brand-gradient-end text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <PublicKanbanBoard offers={offers} />}
      {tab === 'journey' && (
        <PublicJourneyTimeline offers={offers} milestones={milestones} links={links} />
      )}
      {tab === 'classroom' && <PublicClassroomGrid offers={offers} basePath={basePath} />}
    </div>
  )
}
