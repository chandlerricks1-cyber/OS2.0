'use client'

import { useEffect, useRef } from 'react'
import { Loader2, Paperclip, AlertCircle } from 'lucide-react'
import { channelIcon, formatFullTimestamp, type Message } from './types'

interface Props {
  messages: Message[]
  loading: boolean
}

export function ConversationThread({ messages, loading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-3">
      {messages.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No messages yet.</p>
      ) : (
        messages.map((m) => <MessageBubble key={m.ghl_id} m={m} />)
      )}
    </div>
  )
}

function MessageBubble({ m }: { m: Message }) {
  const outbound = m.direction === 'outbound'
  const failed = m.status === 'failed'
  const pending = m.status === 'pending'
  const errMsg = (m.meta as { error?: string } | null)?.error

  return (
    <div className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${outbound ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap ${
            outbound
              ? failed
                ? 'bg-red-50 border border-red-200 text-red-900'
                : 'bg-brand-gradient-end text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          {m.body || <span className="italic opacity-60">(no body)</span>}
          {Array.isArray(m.attachments) && m.attachments.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {m.attachments.map((a, i) => (
                <a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-xs underline ${
                    outbound ? 'text-white/90' : 'text-gray-700'
                  }`}
                >
                  <Paperclip className="w-3 h-3" />
                  {a.name ?? 'file'}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400 px-1">
          <span aria-hidden>{channelIcon(m.message_type)}</span>
          <span>{formatFullTimestamp(m.message_at)}</span>
          {pending && <span className="text-amber-600">sending…</span>}
          {failed && (
            <span className="text-red-600 inline-flex items-center gap-1" title={errMsg}>
              <AlertCircle className="w-3 h-3" /> failed
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
