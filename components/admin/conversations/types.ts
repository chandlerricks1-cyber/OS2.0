export interface ConvContact {
  ghl_id: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
}

export interface Conversation {
  ghl_id: string
  contact_id: string | null
  last_message_type: string | null
  last_message_body: string | null
  last_message_at: string | null
  unread_count: number | null
  inbox_status: string | null
  assigned_to: string | null
  synced_at?: string
  contact?: ConvContact | null
}

export interface Message {
  ghl_id: string
  conversation_id: string
  contact_id: string | null
  direction: 'inbound' | 'outbound'
  message_type: string | null
  body: string | null
  status: string | null
  attachments: Array<{ url?: string; name?: string }> | null
  from_addr: string | null
  to_addr: string | null
  message_at: string
  meta: unknown
}

export const CHANNEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'SMS', label: 'SMS' },
  { value: 'Email', label: 'Email' },
  { value: 'FB', label: 'Facebook' },
  { value: 'IG', label: 'Instagram' },
  { value: 'WhatsApp', label: 'WhatsApp' },
]

export function displayName(c: ConvContact | null | undefined): string {
  if (!c) return '(no contact)'
  return (
    c.full_name ||
    [c.first_name, c.last_name].filter(Boolean).join(' ').trim() ||
    c.email ||
    c.phone ||
    '(no name)'
  )
}

export function channelIcon(type: string | null): string {
  switch ((type ?? '').toLowerCase()) {
    case 'sms': return '💬'
    case 'email': return '✉️'
    case 'fb': case 'facebook': return '📘'
    case 'ig': case 'instagram': return '📸'
    case 'whatsapp': return '🟢'
    case 'call': return '📞'
    case 'voicemail': return '🎙️'
    default: return '·'
  }
}

export function formatTimestamp(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'short' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatFullTimestamp(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
