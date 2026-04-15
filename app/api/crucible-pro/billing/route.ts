import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(body.user_id)
  if (!res.ok) return res.response
  const { supabase, targetUserId, isAdmin } = res.ctx

  if (!isAdmin) {
    return NextResponse.json({ error: 'Only admins can edit billing fields.' }, { status: 403 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('monthly_consulting_fee' in body) {
    const n = Number(body.monthly_consulting_fee)
    updates.monthly_consulting_fee = Number.isFinite(n) ? n : null
  }
  if ('client_agreement_url' in body) updates.client_agreement_url = body.client_agreement_url || null
  if ('next_billing_date' in body) updates.next_billing_date = body.next_billing_date || null

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('user_id', targetUserId)
    .select('*')
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ subscription: data })
}
