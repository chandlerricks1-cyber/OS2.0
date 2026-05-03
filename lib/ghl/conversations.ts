import { getConfig, ghlFetch } from './client'
import { fetchPage, type PageResult } from './paginate'

export type GhlMessageType = 'SMS' | 'Email' | 'WhatsApp' | 'IG' | 'FB' | 'Live_Chat' | 'Call' | 'Voicemail' | string
export type GhlMessageDirection = 'inbound' | 'outbound'

export interface GhlConversation {
  id: string
  contactId?: string
  locationId?: string
  lastMessageType?: GhlMessageType
  lastMessageBody?: string
  lastMessageDate?: string
  unreadCount?: number
  inbox?: boolean
  starred?: boolean
  type?: string
  assignedTo?: string
  fullName?: string
  email?: string
  phone?: string
  [k: string]: unknown
}

export interface GhlMessage {
  id: string
  conversationId?: string
  contactId?: string
  type?: GhlMessageType | number // GHL sometimes returns numeric type codes
  direction?: GhlMessageDirection
  body?: string
  status?: string
  attachments?: Array<string | { url?: string; name?: string }>
  altId?: string
  source?: string
  dateAdded?: string
  meta?: Record<string, unknown>
  [k: string]: unknown
}

export interface SearchConversationsParams {
  query?: string
  contactId?: string
  status?: 'all' | 'unread' | 'recent' | 'starred'
  assignedTo?: string
  limit?: number
  startAfterDate?: string | null
  startAfterId?: string | null
}

export async function searchConversationsPage(params: SearchConversationsParams = {}): Promise<PageResult<GhlConversation>> {
  const { locationId } = getConfig()
  return fetchPage<GhlConversation>({
    basePath: `/conversations/search`,
    arrayKey: 'conversations',
    cursorKey: 'lastMessageDate',
    cursorParam: 'startAfterDate',
    pageSize: params.limit ?? 50,
    cursor: params.startAfterDate,
    searchParams: {
      locationId,
      query: params.query,
      contactId: params.contactId,
      status: params.status,
      assignedTo: params.assignedTo,
    },
  })
}

export async function getConversation(id: string): Promise<GhlConversation | null> {
  try {
    const data = await ghlFetch<{ conversation?: GhlConversation } & GhlConversation>(`/conversations/${id}`)
    return (data.conversation ?? data) as GhlConversation
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null
    throw err
  }
}

export interface GetMessagesParams {
  limit?: number
  lastMessageId?: string | null
  type?: GhlMessageType
}

export async function getMessages(
  conversationId: string,
  params: GetMessagesParams = {}
): Promise<{ messages: GhlMessage[]; nextCursor: string | null }> {
  const qs = new URLSearchParams()
  qs.set('limit', String(params.limit ?? 50))
  if (params.lastMessageId) qs.set('lastMessageId', params.lastMessageId)
  if (params.type) qs.set('type', params.type)
  const data = await ghlFetch<{ messages?: { messages?: GhlMessage[]; lastMessageId?: string } }>(
    `/conversations/${conversationId}/messages?${qs.toString()}`
  )
  // GHL nests under messages.messages
  const inner = data.messages
  const list = inner?.messages ?? []
  const nextCursor = inner?.lastMessageId ?? null
  return { messages: list, nextCursor }
}

export interface SendMessageInput {
  type: GhlMessageType
  contactId: string
  message?: string
  html?: string
  subject?: string
  attachments?: string[] // URLs
  fromNumber?: string
  fromEmail?: string
  templateId?: string
  emailFrom?: string
  emailTo?: string
}

export interface SendMessageResponse {
  conversationId?: string
  messageId?: string
  emailMessageId?: string
  msg?: string
  [k: string]: unknown
}

export async function sendMessage(input: SendMessageInput): Promise<SendMessageResponse> {
  return ghlFetch<SendMessageResponse>(`/conversations/messages`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function markConversationRead(conversationId: string): Promise<void> {
  // GHL exposes conversation update with unreadCount: 0 to mark read.
  await ghlFetch(`/conversations/${conversationId}`, {
    method: 'PUT',
    body: JSON.stringify({ unreadCount: 0 }),
  })
}

export interface UploadFileResult {
  uploadedFiles?: Record<string, string>
  files?: string[]
}

export async function uploadConversationFile(
  conversationId: string,
  file: { name: string; type: string; buffer: Buffer }
): Promise<UploadFileResult> {
  const { apiKey, locationId } = getConfig()
  const form = new FormData()
  form.append('locationId', locationId)
  form.append('conversationId', conversationId)
  // Convert Buffer to a File-like Blob — Node 18+ has global Blob/FormData/fetch
  const blob = new Blob([new Uint8Array(file.buffer)], { type: file.type })
  form.append('fileAttachment', blob, file.name)
  const res = await fetch(`https://services.leadconnectorhq.com/conversations/messages/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: '2021-07-28',
      Accept: 'application/json',
    },
    body: form,
  })
  const text = await res.text()
  let data: UploadFileResult = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = {} }
  if (!res.ok) {
    const err = new Error(`GHL upload ${res.status}: ${text || 'failed'}`)
    // @ts-expect-error attach
    err.status = res.status
    throw err
  }
  return data
}

// GHL message type can come back as numeric code on some endpoints. Map to string.
const MESSAGE_TYPE_MAP: Record<number, GhlMessageType> = {
  0: 'Call',
  1: 'SMS',
  2: 'Email',
  3: 'SMS', // historic
  4: 'WhatsApp',
  5: 'GMB',
  6: 'IG',
  7: 'FB',
  8: 'Custom',
  9: 'WebChat',
  10: 'Live_Chat',
  11: 'SMS',
  12: 'Email',
  13: 'WhatsApp',
  14: 'GMB',
  15: 'IG',
  16: 'FB',
  17: 'Live_Chat',
  18: 'Voicemail',
  19: 'Call',
  20: 'WebChat',
  25: 'Activity',
  26: 'Activity',
  27: 'Activity',
  28: 'Activity',
  29: 'Activity',
}

export function normalizeMessageType(t: GhlMessageType | number | undefined | null): GhlMessageType {
  if (t === undefined || t === null) return 'Unknown'
  if (typeof t === 'number') return MESSAGE_TYPE_MAP[t] ?? `Type${t}`
  return t
}
