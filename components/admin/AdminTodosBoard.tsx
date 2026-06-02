'use client'

import { useMemo, useState } from 'react'
import { Check, Plus, Trash2, User } from 'lucide-react'
import type { Task } from '@/types/cruciblePro'

export type AdminTodoClient = {
  id: string
  full_name: string | null
  email: string
}

export type AdminTodo = Task & {
  owner: { id: string; full_name: string | null; email: string; role: string } | null
}

const PERSONAL_VALUE = '__personal__'

export function AdminTodosBoard({
  initialTasks,
  clients,
  adminId,
}: {
  initialTasks: AdminTodo[]
  clients: AdminTodoClient[]
  adminId: string
}) {
  const [tasks, setTasks] = useState<AdminTodo[]>(initialTasks)
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState<string>(PERSONAL_VALUE)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { active, done } = useMemo(() => {
    const a: AdminTodo[] = []
    const d: AdminTodo[] = []
    for (const t of tasks) (t.status === 'done' ? d : a).push(t)
    return { active: a, done: d }
  }, [tasks])

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmed,
          user_id: clientId === PERSONAL_VALUE ? adminId : clientId,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create')
      setTasks((prev) => [json.task as AdminTodo, ...prev])
      setTitle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleDone(task: AdminTodo) {
    const nextStatus = task.status === 'done' ? 'new' : 'done'
    const prev = tasks
    setTasks((curr) =>
      curr.map((t) =>
        t.id === task.id
          ? { ...t, status: nextStatus, completed_at: nextStatus === 'done' ? new Date().toISOString() : null }
          : t,
      ),
    )
    try {
      const res = await fetch(`/api/crucible-pro/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setTasks(prev)
    }
  }

  async function removeTask(task: AdminTodo) {
    const prev = tasks
    setTasks((curr) => curr.filter((t) => t.id !== task.id))
    try {
      const res = await fetch(`/api/crucible-pro/tasks/${task.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
    } catch {
      setTasks(prev)
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={createTask}
        className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-3"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a to-do..."
            className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
          />
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/40 sm:max-w-xs"
          >
            <option value={PERSONAL_VALUE}>Personal (no client)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name || c.email}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!title.trim() || submitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>

      <TodoSection
        title="Not Done"
        count={active.length}
        tasks={active}
        adminId={adminId}
        onToggle={toggleDone}
        onDelete={removeTask}
      />

      <TodoSection
        title="Done"
        count={done.length}
        tasks={done}
        adminId={adminId}
        onToggle={toggleDone}
        onDelete={removeTask}
        muted
      />
    </div>
  )
}

function TodoSection({
  title,
  count,
  tasks,
  adminId,
  onToggle,
  onDelete,
  muted,
}: {
  title: string
  count: number
  tasks: AdminTodo[]
  adminId: string
  onToggle: (t: AdminTodo) => void
  onDelete: (t: AdminTodo) => void
  muted?: boolean
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        <span className="text-xs text-gray-400">{count}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-400 italic px-1">
          {muted ? 'Nothing completed yet.' : 'No to-dos. Add one above.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <TodoCard
              key={t.id}
              task={t}
              adminId={adminId}
              onToggle={() => onToggle(t)}
              onDelete={() => onDelete(t)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function TodoCard({
  task,
  adminId,
  onToggle,
  onDelete,
}: {
  task: AdminTodo
  adminId: string
  onToggle: () => void
  onDelete: () => void
}) {
  const isDone = task.status === 'done'
  const isPersonal = task.user_id === adminId
  const ownerLabel = isPersonal
    ? 'Personal'
    : task.owner?.full_name || task.owner?.email || 'Unknown client'

  return (
    <li
      className={`flex flex-wrap items-start gap-3 px-4 py-3 rounded-2xl border transition-colors ${
        isDone ? 'bg-gray-50/50 border-gray-100' : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={isDone ? 'Mark not done' : 'Mark done'}
        className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
          isDone
            ? 'bg-gray-300 border-gray-300 text-white'
            : 'border-gray-300 hover:border-brand-orange hover:bg-brand-orange/5'
        }`}
      >
        {isDone && <Check className="w-3 h-3" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug break-words whitespace-normal ${
            isDone ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-900 font-medium'
          }`}
        >
          {task.title}
        </p>
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            isDone
              ? 'bg-gray-100 text-gray-400'
              : isPersonal
              ? 'bg-gray-100 text-gray-600'
              : 'bg-brand-orange/10 text-brand-orange'
          }`}
        >
          <User className="w-3 h-3" />
          {ownerLabel}
        </span>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete"
          className="text-gray-300 hover:text-red-500 transition-colors p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  )
}
