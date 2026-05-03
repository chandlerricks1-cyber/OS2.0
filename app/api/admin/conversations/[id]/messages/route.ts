import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { syncConversationAndLastMessages } from '@/lib/ghl/webhooks/conversations'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id } = await ctx.params
  const refresh = req.nextUrl.searchParams.get('refresh') === '1'
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 100), 500)

  if (refresh) {
    try {
      await syncConversationAndLastMessages(id, { messageLimit: 50 })
    } catch (err) {
      console.warn('[messages refresh] sync failed', err)
    }
  }

  const [convRes, msgsRes] = await Promise.all([
    supabaseAdmin
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
        contact:ghl_contacts(ghl_id, full_name, first_name, last_name, email, phone)
      `)
      .eq('ghl_id', id)
      .maybeSingle(),
    supabaseAdmin
      .from('ghl_messages')
      .select('ghl_id, conversation_id, contact_id, direction, message_type, body, status, attachments, from_addr, to_addr, message_at, meta')
      .eq('conversation_id', id)
      .order('message_at', { ascending: true })
      .limit(limit),
  ])

  if (convRes.error) return NextResponse.json({ error: convRes.error.message }, { status: 500 })
  if (!convRes.data) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json({
    conversation: convRes.data,
    messages: msgsRes.data ?? [],
  })
}
