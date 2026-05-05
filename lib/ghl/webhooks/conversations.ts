import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'
import {
  getConversation,
  getMessages,
  normalizeMessageType,
  type GhlConversation,
  type GhlMessage,
} from '../conversations'

type ConversationRow = Database['public']['Tables']['ghl_conversations']['Insert']
type MessageRow = Database['public']['Tables']['ghl_messages']['Insert']

interface ConversationPayload {
  // Both REST + Workflow shapes
  id?: string
  conversation_id?: string
  conversationId?: string
  contact_id?: string
  contactId?: string
  message_id?: string
  messageId?: string
  message_type?: string
  messageType?: string
  type?: string
  body?: string
  message?: string
  direction?: 'inbound' | 'outbound'
  from?: string
  to?: string
  date_added?: string
  dateAdded?: string
  attachments?: Array<string | { url?: string; name?: string }>
  status?: string
  unread_count?: number
  unreadCount?: number
  [k: string]: unknown
}

function pick<T>(...values: (T | undefined | null)[]): T | undefined {
  for (const v of values) if (v !== undefined && v !== null) return v
  return undefined
}

// GHL returns timestamps as either ISO strings or epoch ms (number or numeric string).
function toIsoTimestamp(v: unknown): string | null {
  if (v === undefined || v === null || v === '') return null
  if (typeof v === 'number') {
    const ms = v < 1e12 ? v * 1000 : v // seconds vs ms
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  if (typeof v === 'string') {
    if (/^\d+$/.test(v)) {
      const n = Number(v)
      const ms = n < 1e12 ? n * 1000 : n
      const d = new Date(ms)
      return Number.isNaN(d.getTime()) ? null : d.toISOString()
    }
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  return null
}

export function mapConversationRow(c: GhlConversation): ConversationRow {
  return {
    ghl_id: c.id,
    contact_id: c.contactId ?? null,
    last_message_type: normalizeMessageType(c.lastMessageType ?? null),
    last_message_body: c.lastMessageBody ?? null,
    last_message_at: toIsoTimestamp(c.lastMessageDate),
    unread_count: c.unreadCount ?? 0,
    inbox_status: c.type ?? null,
    assigned_to: c.assignedTo ?? null,
    raw: c as never,
    synced_at: new Date().toISOString(),
  }
}

export function mapMessageRow(m: GhlMessage, opts: { conversationId: string; contactId?: string | null }): MessageRow {
  const attachments = Array.isArray(m.attachments)
    ? m.attachments.map((a) => (typeof a === 'string' ? { url: a } : a))
    : []
  const direction: 'inbound' | 'outbound' =
    (m.direction as 'inbound' | 'outbound' | undefined) ?? 'outbound'
  return {
    ghl_id: m.id,
    conversation_id: opts.conversationId,
    contact_id: opts.contactId ?? m.contactId ?? null,
    direction,
    message_type: normalizeMessageType(m.type ?? null),
    body: m.body ?? null,
    status: m.status ?? null,
    attachments: attachments as never,
    from_addr: (m as { from?: string }).from ?? null,
    to_addr: (m as { to?: string }).to ?? null,
    message_at: toIsoTimestamp(m.dateAdded) ?? new Date().toISOString(),
    meta: (m.meta as never) ?? null,
    synced_at: new Date().toISOString(),
  }
}

export async function upsertGhlConversation(c: GhlConversation) {
  const row = mapConversationRow(c)
  const { error } = await supabaseAdmin
    .from('ghl_conversations')
    .upsert(row, { onConflict: 'ghl_id' })
  if (error) throw new Error(`upsert ghl_conversations failed: ${error.message}`)
}

export async function upsertGhlMessage(m: GhlMessage, opts: { conversationId: string; contactId?: string | null }) {
  const row = mapMessageRow(m, opts)
  const { error } = await supabaseAdmin
    .from('ghl_messages')
    .upsert(row, { onConflict: 'ghl_id' })
  if (error) throw new Error(`upsert ghl_messages failed: ${error.message}`)
}

export async function syncConversationAndLastMessages(conversationId: string, opts?: { messageLimit?: number }) {
  const conv = await getConversation(conversationId)
  if (!conv) return null
  await upsertGhlConversation(conv)
  const { messages } = await getMessages(conversationId, { limit: opts?.messageLimit ?? 30 })
  if (messages.length > 0) {
    const rows = messages.map((m) => mapMessageRow(m, { conversationId, contactId: conv.contactId ?? null }))
    const { error } = await supabaseAdmin
      .from('ghl_messages')
      .upsert(rows, { onConflict: 'ghl_id' })
    if (error) throw new Error(`upsert ghl_messages bulk failed: ${error.message}`)
  }
  return conv
}

export async function handleConversationWebhook(eventType: string, payload: ConversationPayload) {
  const conversationId = pick<string>(
    payload.conversationId,
    payload.conversation_id,
    (payload.conversation as { id?: string } | undefined)?.id
  )

  switch (eventType) {
    case 'InboundMessage':
    case 'OutboundMessage': {
      // Workflow webhook fields are sparse — fetch the canonical conversation +
      // last messages to ensure body/attachments/status are accurate.
      if (conversationId) {
        await syncConversationAndLastMessages(conversationId, { messageLimit: 10 })
        return
      }
      // Fallback: workflow only had a contact_id — find conversation by contact.
      const contactId = pick<string>(payload.contactId, payload.contact_id)
      if (contactId) {
        // Lazy: just upsert minimal message into "synthetic" conversation by contact.
        // Better to no-op and rely on next event with a real conversationId.
        console.warn('[ghl conv webhook] no conversationId, skipping', { eventType, contactId })
      }
      return
    }
    case 'ConversationUnreadUpdate': {
      if (!conversationId) return
      const unread = pick<number>(payload.unreadCount, payload.unread_count) ?? 0
      const { error } = await supabaseAdmin
        .from('ghl_conversations')
        .update({ unread_count: unread, synced_at: new Date().toISOString() })
        .eq('ghl_id', conversationId)
      if (error) throw new Error(`update unread failed: ${error.message}`)
      return
    }
    default:
      console.log('[ghl conv webhook] unhandled subtype:', eventType)
  }
}
