import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { updateContact, deleteContact, getContact, type UpdateContactInput } from '@/lib/ghl/contacts'
import { upsertGhlContact, softDeleteGhlContact } from '@/lib/ghl/webhooks/contacts'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id } = await ctx.params
  const { data: contact, error } = await supabaseAdmin
    .from('ghl_contacts')
    .select('*')
    .eq('ghl_id', id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!contact) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // Related records (other phases will populate these tables; safe to query empty).
  const [appointments, opportunities, conversations] = await Promise.all([
    supabaseAdmin
      .from('ghl_appointments')
      .select('ghl_id, title, start_time, end_time, appointment_status')
      .eq('contact_id', id)
      .is('deleted_at', null)
      .order('start_time', { ascending: false })
      .limit(25),
    supabaseAdmin
      .from('ghl_opportunities')
      .select('ghl_id, name, status, monetary_value, pipeline_id, stage_id, date_updated')
      .eq('contact_id', id)
      .is('deleted_at', null)
      .order('date_updated', { ascending: false })
      .limit(25),
    supabaseAdmin
      .from('ghl_conversations')
      .select('ghl_id, last_message_type, last_message_body, last_message_at, unread_count')
      .eq('contact_id', id)
      .order('last_message_at', { ascending: false })
      .limit(25),
  ])

  return NextResponse.json({
    contact,
    appointments: appointments.data ?? [],
    opportunities: opportunities.data ?? [],
    conversations: conversations.data ?? [],
  })
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id } = await ctx.params
  const body = (await req.json().catch(() => null)) as UpdateContactInput | null
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 })

  try {
    await updateContact(id, body)
    const fresh = await getContact(id)
    if (fresh) await upsertGhlContact(fresh)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id } = await ctx.params
  try {
    await deleteContact(id)
    await softDeleteGhlContact(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'delete failed' }, { status: 500 })
  }
}
