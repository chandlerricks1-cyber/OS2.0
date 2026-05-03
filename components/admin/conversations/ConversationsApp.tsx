'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ConversationList } from './ConversationList'
import { ConversationThread } from './ConversationThread'
import { MessageComposer } from './MessageComposer'
import type { Conversation, Message } from './types'
import { displayName } from './types'
import { ArrowLeft, Loader2 } from 'lucide-react'

interface ConvListResponse {
  items: Conversation[]
  nextCursor: string | null
  error?: string
}

interface ThreadResponse {
  conversation: Conversation
  messages: Message[]
  error?: string
}

export function ConversationsApp() {
  const [convs, setConvs] = useState<Conversation[]>([])
  const [convCursor, setConvCursor] = useState<string | null>(null)
  const [convHasMore, setConvHasMore] = useState(true)
  const [convLoading, setConvLoading] = useState(false)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [threadLoading, setThreadLoading] = useState(false)

  const [q, setQ] = useState('')
  const [channel, setChannel] = useState<string>('')
  const [onlyUnread, setOnlyUnread] = useState(false)

  const inFlightConvs = useRef(false)
  const supabase = useMemo(() => createClient(), [])

  // ---------- Conversation list ----------
  const fetchConvs = useCallback(async (reset = false) => {
    if (inFlightConvs.current) return
    inFlightConvs.current = true
    setConvLoading(true)
    try {
      const sp = new URLSearchParams()
      if (q.trim()) sp.set('q', q.trim())
      if (channel) sp.set('channel', channel)
      if (onlyUnread) sp.set('unread', '1')
      if (!reset && convCursor) sp.set('cursor', convCursor)
      const res = await fetch(`/api/admin/conversations?${sp.toString()}`)
      const data = (await res.json()) as ConvListResponse
      if (!res.ok) throw new Error(data.error ?? 'load failed')
      setConvs((prev) => (reset ? data.items : [...prev, ...data.items]))
      setConvCursor(data.nextCursor)
      setConvHasMore(!!data.nextCursor)
    } catch (err) {
      console.error('[convs] load', err)
    } finally {
      setConvLoading(false)
      inFlightConvs.current = false
    }
  }, [q, channel, onlyUnread, convCursor])

  useEffect(() => {
    const t = setTimeout(() => {
      setConvs([])
      setConvCursor(null)
      setConvHasMore(true)
      fetchConvs(true)
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, channel, onlyUnread])

  // ---------- Thread ----------
  const loadThread = useCallback(async (id: string, refresh = false) => {
    setThreadLoading(true)
    try {
      const sp = new URLSearchParams()
      if (refresh) sp.set('refresh', '1')
      const res = await fetch(`/api/admin/conversations/${id}/messages?${sp.toString()}`)
      const data = (await res.json()) as ThreadResponse
      if (!res.ok) throw new Error(data.error ?? 'thread load failed')
      setActiveConv(data.conversation)
      setMessages(data.messages)
      // mark as read locally and remotely
      if ((data.conversation?.unread_count ?? 0) > 0) {
        fetch(`/api/admin/conversations/${id}/mark-read`, { method: 'POST' }).catch(() => {})
        setConvs((prev) =>
          prev.map((c) => (c.ghl_id === id ? { ...c, unread_count: 0 } : c))
        )
      }
    } catch (err) {
      console.error('[thread]', err)
    } finally {
      setThreadLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeId) loadThread(activeId, true)
  }, [activeId, loadThread])

  // ---------- Realtime ----------
  useEffect(() => {
    const ch = supabase
      .channel('admin-ghl-conversations')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ghl_messages' },
        (payload) => {
          const m = payload.new as Message
          if (activeId && m.conversation_id === activeId) {
            setMessages((prev) => {
              if (prev.find((x) => x.ghl_id === m.ghl_id)) return prev
              return [...prev, m]
            })
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ghl_messages' },
        (payload) => {
          const m = payload.new as Message
          if (activeId && m.conversation_id === activeId) {
            setMessages((prev) =>
              prev.map((x) => (x.ghl_id === m.ghl_id ? { ...x, ...m } : x))
            )
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ghl_conversations' },
        (payload) => {
          const c = payload.new as Conversation
          setConvs((prev) => {
            const idx = prev.findIndex((x) => x.ghl_id === c.ghl_id)
            if (idx === -1) {
              if (payload.eventType === 'INSERT') return [c, ...prev]
              return prev
            }
            const next = [...prev]
            next[idx] = { ...next[idx], ...c }
            // re-sort by last_message_at desc when timestamp changes
            return next.sort((a, b) => {
              const ta = a.last_message_at ?? ''
              const tb = b.last_message_at ?? ''
              return tb.localeCompare(ta)
            })
          })
          if (activeId && c.ghl_id === activeId) {
            setActiveConv((prev) => (prev ? { ...prev, ...c } : prev))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ch)
    }
  }, [supabase, activeId])

  // ---------- Optimistic outbound ----------
  function appendOptimisticMessage(m: Message) {
    setMessages((prev) => [...prev, m])
  }
  function replaceOptimisticMessage(tempId: string, real: Message | null, errorMsg?: string) {
    setMessages((prev) =>
      prev.map((x) => {
        if (x.ghl_id !== tempId) return x
        if (real) return { ...real }
        return { ...x, status: 'failed', meta: { error: errorMsg } as unknown }
      })
    )
  }

  return (
    <div className="h-full flex bg-white">
      {/* List pane */}
      <aside
        className={`w-full md:w-[360px] flex-shrink-0 border-r border-gray-200 flex flex-col ${
          activeId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ConversationList
          conversations={convs}
          activeId={activeId}
          onSelect={setActiveId}
          loading={convLoading}
          hasMore={convHasMore}
          onLoadMore={() => fetchConvs(false)}
          q={q}
          onQ={setQ}
          channel={channel}
          onChannel={setChannel}
          onlyUnread={onlyUnread}
          onOnlyUnread={setOnlyUnread}
        />
      </aside>

      {/* Thread pane */}
      <section className={`flex-1 flex flex-col min-w-0 ${activeId ? 'flex' : 'hidden md:flex'}`}>
        {!activeId ? (
          <EmptyThread />
        ) : (
          <>
            <header className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 bg-white">
              <button
                onClick={() => setActiveId(null)}
                className="md:hidden p-1 rounded text-gray-500 hover:bg-gray-100"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 truncate">
                  {displayName(activeConv?.contact)}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {activeConv?.contact?.email ?? activeConv?.contact?.phone ?? ''}
                </p>
              </div>
            </header>

            <ConversationThread messages={messages} loading={threadLoading} />

            {activeConv?.contact_id ? (
              <MessageComposer
                conversationId={activeId}
                contactId={activeConv.contact_id}
                defaultChannel={(activeConv.last_message_type as string | null) ?? 'SMS'}
                onOptimistic={appendOptimisticMessage}
                onSent={replaceOptimisticMessage}
              />
            ) : (
              <div className="px-4 py-3 text-xs text-amber-700 bg-amber-50 border-t border-amber-200">
                This conversation has no linked contact — cannot reply.
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function EmptyThread() {
  return (
    <div className="flex-1 flex items-center justify-center text-sm text-gray-500 p-8 text-center">
      <div>
        <Loader2 className="w-6 h-6 mx-auto mb-3 text-gray-300" strokeWidth={1.5} />
        Pick a conversation from the list to view the thread.
      </div>
    </div>
  )
}
