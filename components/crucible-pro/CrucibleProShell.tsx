'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { ClientSelector } from './ClientSelector'
import { AppointmentsTab } from './AppointmentsTab'
import { RecordingsTab } from './RecordingsTab'
import { GoalsTeamTab } from './GoalsTeamTab'
import { BillingTab } from './BillingTab'
import type {
  Appointment,
  BillingSnapshot,
  CallRecording,
  ClientOption,
  Rock,
  Task,
  TeamMember,
} from '@/types/cruciblePro'

type TabId = 'appointments' | 'recordings' | 'goals' | 'billing'

const TABS: { id: TabId; label: string }[] = [
  { id: 'appointments', label: 'Appointments' },
  { id: 'recordings', label: 'Recordings' },
  { id: 'goals', label: 'Goals & Team' },
  { id: 'billing', label: 'Billing' },
]

const URGENT_HELP_URL =
  process.env.NEXT_PUBLIC_GHL_URGENT_HELP_URL ?? 'https://api.leadconnectorhq.com/widget/booking/crucible-urgent'

export function CrucibleProShell({
  isAdmin,
  clients,
  targetUserId,
  clientName,
  initialTab,
  appointments,
  recordings,
  tasks,
  teamMembers,
  rocks,
  revenueGoal,
  billing,
}: {
  isAdmin: boolean
  clients: ClientOption[]
  targetUserId: string
  clientName: string
  initialTab: TabId
  appointments: Appointment[]
  recordings: CallRecording[]
  tasks: Task[]
  teamMembers: TeamMember[]
  rocks: Rock[]
  revenueGoal: number | null
  billing: BillingSnapshot
}) {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>(initialTab)

  function go(next: TabId) {
    setTab(next)
    const params = new URLSearchParams()
    if (next !== 'appointments') params.set('tab', next)
    if (isAdmin && targetUserId) params.set('client', targetUserId)
    const qs = params.toString()
    router.replace(`/dashboard/crucible-pro${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  function onClientChange(clientId: string) {
    const params = new URLSearchParams()
    if (tab !== 'appointments') params.set('tab', tab)
    params.set('client', clientId)
    router.replace(`/dashboard/crucible-pro?${params.toString()}`)
    router.refresh()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crucible Pro</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the live engagement — appointments, accountabilities, call archive, goals, billing.
          </p>
        </div>
        <a
          href={URGENT_HELP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-brand-orange hover:brightness-110 transition"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="sm:hidden">Urgent help</span>
          <span className="hidden sm:inline">Need Urgent Help? Schedule a help call</span>
        </a>
      </div>

      {isAdmin && clients.length > 0 && (
        <ClientSelector clients={clients} value={targetUserId} onChange={onClientChange} />
      )}

      <div className="border-b border-gray-200 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => go(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              tab === t.id
                ? 'border-brand-gradient-end text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'appointments' && (
        <AppointmentsTab
          appointments={appointments}
          tasks={tasks}
          teamMembers={teamMembers}
          targetUserId={targetUserId}
          clientName={clientName}
          isAdmin={isAdmin}
        />
      )}
      {tab === 'recordings' && (
        <RecordingsTab
          recordings={recordings}
          tasks={tasks}
          targetUserId={targetUserId}
          isAdmin={isAdmin}
        />
      )}
      {tab === 'goals' && (
        <GoalsTeamTab
          rocks={rocks}
          teamMembers={teamMembers}
          revenueGoal={revenueGoal}
          targetUserId={targetUserId}
          isAdmin={isAdmin}
        />
      )}
      {tab === 'billing' && <BillingTab billing={billing} targetUserId={targetUserId} isAdmin={isAdmin} />}
    </div>
  )
}
