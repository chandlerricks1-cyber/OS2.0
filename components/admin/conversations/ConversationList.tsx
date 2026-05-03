'use client'

import { Search, X, Loader2, Filter } from 'lucide-react'
import {
  CHANNEL_OPTIONS,
  channelIcon,
  displayName,
  formatTimestamp,
  type Conversation,
} from './types'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  q: string
  onQ: (v: string) => void
  channel: string
  onChannel: (v: string) => void
  onlyUnread: boolean
  onOnlyUnread: (v: boolean) => void
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  loading,
  hasMore,
  onLoadMore,
  q,
  onQ,
  channel,
  onChannel,
  onlyUnread,
  onOnlyUnread,
}: Props) {
  return (
    <>
      <div className="p-3 border-b border-gray-200 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Search messages…"
            className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gradient-end/30 focus:border-brand-gradient-end"
          />
          {q && (
            <button
              onClick={() => onQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select
            value={channel}
            onChange={(e) => onChannel(e.target.value)}
            className="px-2 py-1.5 rounded border border-gray-200 bg-white text-gray-700"
          >
            <option value="">All channels</option>
            {CHANNEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyUnread}
              onChange={(e) => onOnlyUnread(e.target.checked)}
              className="rounded border-gray-300 text-brand-gradient-end focus:ring-brand-gradient-end"
            />
            <span>Unread only</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && !loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            <Filter className="w-5 h-5 text-gray-300 mx-auto mb-2" />
            No conversations match. Try clearing filters or run the conversations backfill in Integrations.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {conversations.map((c) => {
              const active = c.ghl_id === activeId
              const unread = (c.unread_count ?? 0) > 0
              return (
                <li key={c.ghl_id}>
                  <button
                    onClick={() => onSelect(c.ghl_id)}
                    className={`w-full text-left px-3 py-3 flex gap-3 transition-colors ${
                      active ? 'bg-brand-gradient-end/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base mt-0.5" aria-hidden>
                      {channelIcon(c.last_message_type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm truncate ${
                            unread ? 'font-semibold text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {displayName(c.contact)}
                        </p>
                        <span className="text-[11px] text-gray-400 shrink-0">
                          {formatTimestamp(c.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p
                          className={`text-xs truncate ${
                            unread ? 'text-gray-700' : 'text-gray-500'
                          }`}
                        >
                          {c.last_message_body || '(no preview)'}
                        </p>
                        {unread && (
                          <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold bg-brand-orange text-white shrink-0">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {(loading || hasMore) && conversations.length > 0 && (
          <div className="p-3 flex items-center justify-center border-t border-gray-100">
            {loading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <button
                onClick={onLoadMore}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
