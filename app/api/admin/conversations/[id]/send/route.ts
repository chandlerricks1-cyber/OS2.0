import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendMessage, type GhlMessageType } from '@/lib/ghl/conversations'
import { syncConversationAndLastMessages } from '@/lib/ghl/webhooks/conversations'

export const runtime = 'nodejs'

interface SendBody {
  type: GhlMessageType
  message?: string
  html?: string
  subject?: string
  attachments?: string[]
  fromNumber?: string
  fromEmail?: string
  dedupeKey: string
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id: conversationId } = await ctx.params
  const body = (await req.json().catch(() => null)) as SendBody | null
  if (!body || !body.type || !body.dedupeKey) {
    return NextResponse.json({ error: 'type and dedupeKey required' }, { status: 400 })
  }

  // Look up contactId from conversation
  const { data: conv } = await supabaseAdmin
    .from('ghl_conversations')
    .select('contact_id')
    .eq('ghl_id', conversationId)
    .maybeSingle()
  if (!conv?.contact_id) {
    return NextResponse.json({ error: 'conversation has no contact' }, { status: 400 })
  }

  // Idempotency: insert send-attempt row; if dedupeKey already exists, return prior result.
  const { data: existing, error: dupErr } = await supabaseAdmin
    .from('ghl_outbound_sends')
    .select('id, status, ghl_message_id, error')
    .eq('client_dedupe_key', body.dedupeKey)
    .maybeSingle()
  if (dupErr) return NextResponse.json({ error: dupErr.message }, { status: 500 })
  if (existing) {
    return NextResponse.json({
      duplicate: true,
      messageId: existing.ghl_message_id,
      status: existing.status,
      error: existing.error,
    })
  }

  const { data: insertedSend, error: insertErr } = await supabaseAdmin
    .from('ghl_outbound_sends')
    .insert({
      client_dedupe_key: body.dedupeKey,
      conversation_id: conversationId,
      status: 'pending',
    })
    .select('id')
    .single()
  if (insertErr || !insertedSend) {
    if (insertErr?.code === '23505') {
      // Race — fetch the row
      const { data: race } = await supabaseAdmin
        .from('ghl_outbound_sends')
        .select('ghl_message_id, status, error')
        .eq('client_dedupe_key', body.dedupeKey)
        .maybeSingle()
      return NextResponse.json({ duplicate: true, ...race })
    }
    return NextResponse.json({ error: insertErr?.message ?? 'send insert failed' }, { status: 500 })
  }

  try {
    const res = await sendMessage({
      type: body.type,
      contactId: conv.contact_id,
      message: body.message,
      html: body.html,
      subject: body.subject,
      attachments: body.attachments,
      fromNumber: body.fromNumber,
      fromEmail: body.fromEmail,
    })

    const messageId = res.messageId ?? res.emailMessageId ?? null

    await supabaseAdmin
      .from('ghl_outbound_sends')
      .update({
        status: 'sent',
        ghl_message_id: messageId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', insertedSend.id)

    // Pull the canonical message back into our mirror so the UI shows it.
    syncConversationAndLastMessages(conversationId, { messageLimit: 5 }).catch((err) => {
      console.warn('[send] post-send sync failed', err)
    })

    return NextResponse.json({ ok: true, messageId, raw: res })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'send failed'
    await supabaseAdmin
      .from('ghl_outbound_sends')
      .update({
        status: 'failed',
        error: msg,
        completed_at: new Date().toISOString(),
      })
      .eq('id', insertedSend.id)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
