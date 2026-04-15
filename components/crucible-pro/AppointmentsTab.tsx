'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Users, RefreshCw, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Appointment, Task, TaskStatus, TeamMember } from '@/types/cruciblePro'
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@/types/cruciblePro'

export function AppointmentsTab({
  appointments,
  tasks,
  teamMembers,
  targetUserId,
  isAdmin,
}: {
  appointments: Appointment[]
  tasks: Task[]
  teamMembers: TeamMember[]
  targetUserId: string
  isAdmin: boolean
}) {
  const upcoming = appointments
    .filter((a) => new Date(a.starts_at).getTime() > Date.now())
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0]

  return (
    <div className="space-y-6">
      <UpcomingCard appointment={upcoming} targetUserId={targetUserId} isAdmin={isAdmin} />
      <TaskListCard tasks={tasks} teamMembers={teamMembers} targetUserId={targetUserId} isAdmin={isAdmin} />
      <CompletedTasksCard tasks={tasks} />
    </div>
  )
}

function UpcomingCard({
  appointment,
  targetUserId,
  isAdmin,
}: {
  appointment: Appointment | undefined
  targetUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  async function sync() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/crucible-pro/appointments/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: isAdmin ? targetUserId : undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Sync failed')
      setSyncMsg(`Synced ${json.synced ?? 0} events from GHL`)
      router.refresh()
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointment</h2>
        </div>
        <div className="flex items-center gap-3">
          {appointment && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
          <button
            onClick={sync}
            disabled={syncing}
            className="text-sm text-brand-orange hover:underline inline-flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync from GHL'}
          </button>
        </div>
      </div>
      {syncMsg && <p className="mt-2 text-xs text-gray-500">{syncMsg}</p>}

      {!appointment ? (
        <p className="mt-4 text-sm text-gray-500">
          No upcoming appointment. Hit &quot;Sync from GHL&quot; to pull in scheduled events.
        </p>
      ) : editing ? (
        <EditAppointmentForm appointment={appointment} onClose={() => setEditing(false)} />
      ) : (
        <AppointmentDisplay appointment={appointment} />
      )}
    </div>
  )
}

function AppointmentDisplay({ appointment }: { appointment: Appointment }) {
  const [countdown, setCountdown] = useState(formatCountdown(appointment.starts_at))
  useEffect(() => {
    const t = setInterval(() => setCountdown(formatCountdown(appointment.starts_at)), 1000)
    return () => clearInterval(t)
  }, [appointment.starts_at])

  return (
    <div className="mt-4 space-y-3">
      <div className="text-xl font-bold text-gray-900">{appointment.title}</div>
      <div className="flex items-center gap-6 flex-wrap text-sm text-gray-600">
        <div className="inline-flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {new Date(appointment.starts_at).toLocaleString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </div>
        <div className="inline-flex items-center gap-2 text-brand-orange font-semibold">
          <Clock className="w-4 h-4" />
          {countdown}
        </div>
      </div>
      {appointment.guests.length > 0 && (
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          {appointment.guests.join(', ')}
        </div>
      )}
      {appointment.meeting_link && (
        <a
          href={appointment.meeting_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-brand-orange hover:underline"
        >
          Join meeting →
        </a>
      )}
      {appointment.notes && (
        <p className="text-sm text-gray-600 whitespace-pre-line border-t border-gray-100 pt-3">
          {appointment.notes}
        </p>
      )}
    </div>
  )
}

function EditAppointmentForm({
  appointment,
  onClose,
}: {
  appointment: Appointment
  onClose: () => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState(appointment.title)
  const [startsAt, setStartsAt] = useState(toLocalDatetimeInput(appointment.starts_at))
  const [notes, setNotes] = useState(appointment.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/crucible-pro/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          starts_at: new Date(startsAt).toISOString(),
          notes: notes || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      if (json.warning) setError(json.warning)
      router.refresh()
      if (!json.warning) onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-4 space-y-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
      />
      <input
        type="datetime-local"
        value={startsAt}
        onChange={(e) => setStartsAt(e.target.value)}
        className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Notes / agenda"
        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
      />
      {error && <p className="text-xs text-amber-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </div>
  )
}

function TaskListCard({
  tasks,
  teamMembers,
  targetUserId,
  isAdmin,
}: {
  tasks: Task[]
  teamMembers: TeamMember[]
  targetUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [memberId, setMemberId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createTask() {
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    try {
      const member = teamMembers.find((m) => m.id === memberId)
      const res = await fetch('/api/crucible-pro/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: isAdmin ? targetUserId : undefined,
          title: title.trim(),
          accountable_team_member_id: member?.id ?? null,
          accountable_name: member?.name ?? null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to create task')
      setTitle('')
      setMemberId('')
      setCreating(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id: string, status: TaskStatus) {
    await fetch(`/api/crucible-pro/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/crucible-pro/tasks/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const active = tasks.filter((t) => t.status !== 'done')

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Accountabilities</h2>
        <button
          onClick={() => setCreating((v) => !v)}
          className="text-sm text-brand-orange hover:underline inline-flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'Cancel' : 'Add task'}
        </button>
      </div>

      {creating && (
        <div className="mt-4 space-y-2 border border-gray-200 rounded-xl p-4 bg-gray-50">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to happen?"
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white"
          >
            <option value="">Accountable — unassigned</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.position ? ` — ${m.position}` : ''}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={createTask}
            disabled={saving || !title.trim()}
            className="px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add task'}
          </button>
        </div>
      )}

      {active.length === 0 && !creating && (
        <p className="mt-4 text-sm text-gray-500">No active tasks. Coaching calls generate tasks that land here.</p>
      )}

      <ul className="mt-4 divide-y divide-gray-100">
        {active.map((t) => (
          <li key={t.id} className="py-3 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 break-words">{t.title}</div>
              {t.accountable_name && (
                <div className="text-xs text-gray-500 mt-0.5">Accountable: {t.accountable_name}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={t.status}
                onChange={(e) => updateStatus(t.id, e.target.value as TaskStatus)}
                className="text-xs font-medium px-2 py-1 rounded-md border border-gray-200 bg-white"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CompletedTasksCard({ tasks }: { tasks: Task[] }) {
  const completed = tasks.filter((t) => t.status === 'done')
  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <h2 className="text-lg font-semibold text-gray-900">Completed Tasks</h2>
      <p className="text-xs text-gray-500 mt-1">Progress and traction.</p>
      {completed.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">Completed tasks show up here as you close them.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {completed.map((t) => (
            <li key={t.id} className="py-2 flex items-center justify-between">
              <span className="text-sm text-gray-900 line-through decoration-gray-300">{t.title}</span>
              <span className="text-xs text-gray-400">
                {t.completed_at ? new Date(t.completed_at).toLocaleDateString() : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatCountdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Starting now'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`
}
