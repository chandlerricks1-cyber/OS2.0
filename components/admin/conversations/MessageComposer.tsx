'use client'

import { useEffect, useRef, useState } from 'react'
import { Paperclip, Send, Loader2, X } from 'lucide-react'
import { CHANNEL_OPTIONS, type Message } from './types'

interface Props {
  conversationId: string
  contactId: string
  defaultChannel: string
  onOptimistic: (m: Message) => void
  onSent: (tempId: string, real: Message | null, errorMsg?: string) => void
}

function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const CHANNELS_WITH_SUBJECT = new Set(['Email'])

export function MessageComposer({
  conversationId,
  contactId,
  defaultChannel,
  onOptimistic,
  onSent,
}: Props) {
  const [channel, setChannel] = useState(() => normalizeChannel(defaultChannel))
  const [body, setBody] = useState('')
  const [subject, setSubject] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const textarea = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setChannel(normalizeChannel(defaultChannel))
    setBody('')
    setSubject('')
    setFiles([])
    setError(null)
  }, [conversationId, defaultChannel])

  function pickFiles() {
    fileInput.current?.click()
  }
  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = e.target.files ? Array.from(e.target.files) : []
    setFiles((prev) => [...prev, ...fs].slice(0, 5))
    e.target.value = ''
  }
  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function uploadIfAny(): Promise<string[]> {
    if (files.length === 0) return []
    const fd = new FormData()
    for (const f of files) fd.append('files', f)
    const res = await fetch(`/api/admin/conversations/${conversationId}/upload`, {
      method: 'POST',
      body: fd,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'attachment upload failed')
    return Array.isArray(data.urls) ? data.urls : []
  }

  async function send() {
    if (!body.trim() && files.length === 0) return
    setError(null)
    setSending(true)

    const tempId = `tmp-${uid()}`
    const dedupeKey = uid()
    const optimistic: Message = {
      ghl_id: tempId,
      conversation_id: conversationId,
      contact_id: contactId,
      direction: 'outbound',
      message_type: channel,
      body: body.trim() || null,
      status: 'pending',
      attachments: files.map((f) => ({ name: f.name })),
      from_addr: null,
      to_addr: null,
      message_at: new Date().toISOString(),
      meta: null,
    }
    onOptimistic(optimistic)

    try {
      const attachments = await uploadIfAny()
      const sendRes = await fetch(`/api/admin/conversations/${conversationId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: channel,
          message: body.trim() || undefined,
          subject: CHANNELS_WITH_SUBJECT.has(channel) ? subject || undefined : undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
          dedupeKey,
        }),
      })
      const data = await sendRes.json()
      if (!sendRes.ok) throw new Error(data.error ?? 'send failed')

      // Real message will arrive via Realtime soon; mark the optimistic placeholder
      // as sent and let the realtime INSERT replace it (we keyed by ghl_id, so the
      // real one comes in as a separate row — strip the placeholder).
      onSent(tempId, null) // remove pending → mark failed-style? No: clear pending visually.
      // Better: replace optimistic with a "sent" placeholder bearing the real id.
      const realId = data.messageId ?? null
      if (realId) {
        onSent(tempId, {
          ...optimistic,
          ghl_id: realId,
          status: 'sent',
        })
      } else {
        // No id yet — drop placeholder; realtime will populate.
        onSent(tempId, null)
      }
      setBody('')
      setSubject('')
      setFiles([])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'send failed'
      setError(msg)
      onSent(tempId, null, msg)
    } finally {
      setSending(false)
      textarea.current?.focus()
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3 space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          disabled={sending}
          className="px-2 py-1.5 rounded border border-gray-200 bg-white text-xs text-gray-700"
        >
          {CHANNEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {CHANNELS_WITH_SUBJECT.has(channel) && (
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            disabled={sending}
            className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-xs"
          />
        )}
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {files.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-xs text-gray-700"
            >
              <Paperclip className="w-3 h-3" />
              <span className="max-w-[120px] truncate">{f.name}</span>
              <button
                onClick={() => removeFile(i)}
                disabled={sending}
                className="text-gray-400 hover:text-red-600"
                aria-label="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={pickFiles}
          disabled={sending || files.length >= 5}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40"
          aria-label="Attach files"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          onChange={onFiles}
          className="hidden"
        />
        <textarea
          ref={textarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKey}
          placeholder={`Type a ${channel} message… (⌘+Enter to send)`}
          rows={2}
          disabled={sending}
          className="flex-1 resize-none px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gradient-end/30 focus:border-brand-gradient-end"
        />
        <button
          onClick={send}
          disabled={sending || (!body.trim() && files.length === 0)}
          className="btn-gradient px-4 py-2 inline-flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

function normalizeChannel(t: string | null | undefined): string {
  if (!t) return 'SMS'
  const s = String(t)
  if (s.toLowerCase() === 'email') return 'Email'
  if (s.toLowerCase().startsWith('fb')) return 'FB'
  if (s.toLowerCase().startsWith('ig')) return 'IG'
  if (s.toLowerCase() === 'whatsapp') return 'WhatsApp'
  return 'SMS'
}
