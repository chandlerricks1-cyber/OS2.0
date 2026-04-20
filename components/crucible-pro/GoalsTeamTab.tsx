'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Users, Copy, Check, Plus, Trash2, Pencil } from 'lucide-react'
import type { Rock, TeamMember } from '@/types/cruciblePro'
import { updateRevenueGoal } from '@/lib/actions'

const CHANDLER_INVITE_EMAIL = 'chandler@cruciblecoaching.org'

export function GoalsTeamTab({
  rocks,
  teamMembers,
  revenueGoal,
  targetUserId,
  isAdmin,
}: {
  rocks: Rock[]
  teamMembers: TeamMember[]
  revenueGoal: number | null
  targetUserId: string
  isAdmin: boolean
}) {
  return (
    <div className="space-y-6">
      <RevenueGoalCard revenueGoal={revenueGoal} targetUserId={targetUserId} />
      <RocksCard rocks={rocks} targetUserId={targetUserId} isAdmin={isAdmin} />
      <TeamCard teamMembers={teamMembers} targetUserId={targetUserId} isAdmin={isAdmin} />
      <InviteChandlerCard />
    </div>
  )
}

function RevenueGoalCard({ revenueGoal, targetUserId }: { revenueGoal: number | null; targetUserId: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(revenueGoal?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEditing() {
    setValue(revenueGoal?.toString() ?? '')
    setError(null)
    setEditing(true)
  }

  async function save() {
    const parsed = parseFloat(value.replace(/[^0-9.]/g, ''))
    if (isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid dollar amount')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateRevenueGoal(targetUserId, parsed)
      setEditing(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold">
          <Target className="w-4 h-4" />
          Long-term revenue goal
        </div>
        {!editing && (
          <button
            onClick={startEditing}
            className="text-gray-400 hover:text-brand-orange transition"
            title="Edit revenue goal"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-400">$</span>
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
                if (e.key === 'Escape') setEditing(false)
              }}
              placeholder="e.g. 5000000"
              className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-brand-orange focus:outline-none w-full"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="px-3 py-1.5 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 rounded-full text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {revenueGoal ? formatCurrency(revenueGoal) : '—'}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Auto-populated from intake. Click the pencil to update.
          </p>
        </>
      )}
    </div>
  )
}

function RocksCard({
  rocks,
  targetUserId,
  isAdmin,
}: {
  rocks: Rock[]
  targetUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/crucible-pro/rocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: isAdmin ? targetUserId : undefined,
          title: title.trim(),
          description: description.trim() || null,
          target_date: targetDate || null,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to create rock')
      setTitle('')
      setDescription('')
      setTargetDate('')
      setCreating(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create rock')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id: string, status: Rock['status']) {
    await fetch(`/api/crucible-pro/rocks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm('Delete this rock?')) return
    await fetch(`/api/crucible-pro/rocks/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const active = rocks.filter((r) => r.status === 'active')
  const past = rocks.filter((r) => r.status !== 'active')

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">30–90 Day Rocks</h2>
        <button
          onClick={() => setCreating((v) => !v)}
          className="text-sm text-brand-orange hover:underline inline-flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'Cancel' : 'Add rock'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">Short-term goals aligned to the long-term revenue target.</p>

      {creating && (
        <div className="mt-4 space-y-2 border border-gray-200 rounded-xl p-4 bg-gray-50">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Rock title (e.g. Launch premium tier to 20 clients)"
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why this rock, key milestones, definition of done…"
            rows={3}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500">Target date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={submit}
            disabled={saving || !title.trim()}
            className="px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save rock'}
          </button>
        </div>
      )}

      {active.length === 0 && !creating && (
        <p className="mt-4 text-sm text-gray-500">No active rocks yet.</p>
      )}

      <div className="mt-4 space-y-3">
        {active.map((r) => (
          <div key={r.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{r.title}</div>
                {r.description && <p className="text-sm text-gray-600 mt-1">{r.description}</p>}
                {r.target_date && (
                  <div className="text-xs text-gray-500 mt-2">Target: {new Date(r.target_date).toLocaleDateString()}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateStatus(r.id, 'completed')}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Complete
                </button>
                <button onClick={() => remove(r.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {past.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer">Past rocks ({past.length})</summary>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            {past.map((r) => (
              <li key={r.id} className="flex justify-between py-1">
                <span>
                  <span className="text-xs uppercase tracking-wide text-gray-400 mr-2">{r.status}</span>
                  {r.title}
                </span>
                <button onClick={() => remove(r.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

function TeamCard({
  teamMembers,
  targetUserId,
  isAdmin,
}: {
  teamMembers: TeamMember[]
  targetUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    accountabilities: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/crucible-pro/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: isAdmin ? targetUserId : undefined,
          name: form.name.trim(),
          position: form.position.trim() || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          accountabilities: form.accountabilities
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to add team member')
      setForm({ name: '', position: '', phone: '', email: '', accountabilities: '' })
      setAdding(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add team member')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this team member?')) return
    await fetch(`/api/crucible-pro/team/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Your Team</h2>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-sm text-brand-orange hover:underline inline-flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {adding ? 'Cancel' : 'Add member'}
        </button>
      </div>

      {adding && (
        <div className="mt-4 space-y-2 border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
            />
            <input
              placeholder="Position"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
            />
          </div>
          <input
            placeholder="Accountabilities (comma-separated)"
            value={form.accountabilities}
            onChange={(e) => setForm({ ...form, accountabilities: e.target.value })}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={submit}
            disabled={saving || !form.name.trim()}
            className="px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add member'}
          </button>
        </div>
      )}

      {teamMembers.length === 0 && !adding && (
        <p className="mt-4 text-sm text-gray-500">Add the key people on your team Chandler should know about.</p>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {teamMembers.map((m) => (
          <div key={m.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900">{m.name}</div>
                {m.position && <div className="text-sm text-gray-600">{m.position}</div>}
                <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                  {m.email && <div>{m.email}</div>}
                  {m.phone && <div>{m.phone}</div>}
                </div>
                {m.accountabilities.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
                    {m.accountabilities.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button onClick={() => remove(m.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InviteChandlerCard() {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(CHANDLER_INVITE_EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end text-white rounded-[25px] p-6">
      <h2 className="text-lg font-semibold">Want to add Chandler into your software?</h2>
      <p className="text-sm text-white/80 mt-1">
        Send an invite to the email below and Chandler will accept. He uses these logins to coach you on CAC, funnels,
        and ops in real time.
      </p>
      <button
        onClick={copy}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 transition text-sm font-medium"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {CHANDLER_INVITE_EMAIL}
      </button>
    </div>
  )
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}
