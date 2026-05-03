import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { markConversationRead } from '@/lib/ghl/conversations'

export const runtime = 'nodejs'

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id } = await ctx.params

  // Optimistically zero locally; mirror to GHL.
  await supabaseAdmin
    .from('ghl_conversations')
    .update({ unread_count: 0, synced_at: new Date().toISOString() })
    .eq('ghl_id', id)

  try {
    await markConversationRead(id)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'mark-read failed' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
