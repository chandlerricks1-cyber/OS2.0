'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Video, ChevronDown, ChevronRight } from 'lucide-react'
import type { CallRecording, Task } from '@/types/cruciblePro'
import { formatSeconds } from '@/lib/crucible-pro/transcript'

export function RecordingsTab({
  recordings,
  tasks,
  targetUserId,
  isAdmin,
}: {
  recordings: CallRecording[]
  tasks: Task[]
  targetUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)

  async function onDelete(id: string) {
    if (!confirm('Delete this recording?')) return
    await fetch(`/api/crucible-pro/recordings/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-sm text-brand-orange hover:underline inline-flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {adding ? 'Cancel' : 'Add recording'}
        </button>
      </div>

      {adding && (
        <NewRecordingForm
          targetUserId={targetUserId}
          isAdmin={isAdmin}
          onSaved={() => {
            setAdding(false)
            router.refresh()
          }}
        />
      )}

      {recordings.length === 0 && !adding && (
        <div className="bg-white border border-gray-200 rounded-[25px] p-8 text-center">
          <Video className="w-8 h-8 text-gray-300 mx-auto" />
          <h2 className="mt-3 text-lg font-semibold text-gray-900">No past calls yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            After each call, paste the Zoom cloud link and transcript above. We&apos;ll organize them here with
            timestamps and linked tasks.
          </p>
        </div>
      )}

      {recordings.map((r) => (
        <RecordingCard key={r.id} recording={r} tasks={tasks} onDelete={() => onDelete(r.id)} />
      ))}
    </div>
  )
}

function NewRecordingForm({
  targetUserId,
  isAdmin,
  onSaved,
}: {
  targetUserId: string
  isAdmin: boolean
  onSaved: () => void
}) {
  const [title, setTitle] = useState('')
  const [callDate, setCallDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [zoomUrl, setZoomUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!title.trim() || !callDate) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/crucible-pro/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: isAdmin ? targetUserId : undefined,
          title: title.trim(),
          call_date: new Date(callDate).toISOString(),
          zoom_recording_url: zoomUrl || null,
          transcript_raw: transcript || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to save')
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6 space-y-3">
      <h3 className="font-semibold text-gray-900">New recording</h3>
      <input
        placeholder="Call title (e.g. Week 4 coaching — funnel audit)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
      />
      <input
        type="datetime-local"
        value={callDate}
        onChange={(e) => setCallDate(e.target.value)}
        className="text-sm px-3 py-2 rounded-lg border border-gray-200"
      />
      <input
        placeholder="Zoom cloud recording URL"
        value={zoomUrl}
        onChange={(e) => setZoomUrl(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
      />
      <textarea
        placeholder="Paste transcript (VTT, SRT, or Zoom-style all work)"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={8}
        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        onClick={save}
        disabled={saving || !title.trim() || !callDate}
        className="px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save recording'}
      </button>
    </div>
  )
}

function RecordingCard({
  recording,
  tasks,
  onDelete,
}: {
  recording: CallRecording
  tasks: Task[]
  onDelete: () => void
}) {
  const [openTranscript, setOpenTranscript] = useState(false)
  const linkedTasks = tasks.filter((t) => t.call_recording_id === recording.id)
  const segments = recording.transcript_segments ?? []

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">{recording.title}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(recording.call_date).toLocaleString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {recording.zoom_recording_url && (
            <a
              href={recording.zoom_recording_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand-orange hover:underline"
            >
              <Video className="w-4 h-4" />
              Open recording
            </a>
          )}
          <button onClick={onDelete} className="text-gray-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {segments.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setOpenTranscript((v) => !v)}
            className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
          >
            {openTranscript ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Transcript ({segments.length} segments)
          </button>
          {openTranscript && (
            <div className="mt-3 max-h-96 overflow-y-auto border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-2 text-sm">
              {segments.map((seg, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xs text-gray-400 font-mono min-w-[56px] shrink-0">
                    {formatSeconds(seg.start_seconds)}
                  </span>
                  <div className="flex-1">
                    {seg.speaker && <span className="font-semibold text-gray-700">{seg.speaker}: </span>}
                    <span className="text-gray-700">{seg.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {linkedTasks.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
            Tasks from this call
          </div>
          <ul className="space-y-1 text-sm">
            {linkedTasks.map((t) => (
              <li key={t.id} className="flex justify-between">
                <span className={t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}>
                  {t.title}
                </span>
                <span className="text-xs text-gray-400">{t.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
