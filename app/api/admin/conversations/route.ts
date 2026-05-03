import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const PAGE_SIZE = 50

export async function GET(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const sp = req.nextUrl.searchParams
  const q = sp.get('q')?.trim() ?? ''
  const channel = sp.get('channel')?.trim() ?? ''
  const onlyUnread = sp.get('unread') === '1'
  const cursor = sp.get('cursor')
  const limit = Math.min(Number(sp.get('limit') ?? PAGE_SIZE), 200)

  let query = supabaseAdmin
    .from('ghl_conversations')
    .select(`
      ghl_id,
      contact_id,
      last_message_type,
      last_message_body,
      last_message_at,
      unread_count,
      inbox_status,
      assigned_to,
      synced_at,
      contact:ghl_contacts(ghl_id, full_name, first_name, last_name, email, phone)
    `)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('ghl_id', { ascending: false })
    .limit(limit + 1)

  if (channel) query = query.eq('last_message_type', channel)
  if (onlyUnread) query = query.gt('unread_count', 0)
  if (cursor) query = query.lt('last_message_at', cursor)
  if (q) {
    query = query.or(`last_message_body.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const items = (data ?? []).slice(0, limit)
  const nextCursor =
    (data ?? []).length > limit && items.length > 0
      ? items[items.length - 1].last_message_at
      : null

  return NextResponse.json({ items, nextCursor })
}
