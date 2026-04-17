import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULTS = {
  email_reports: true,
  email_updates: true,
  timezone: 'America/New_York',
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('user_preferences')
    .select('email_reports, email_updates, timezone')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json(data ?? DEFAULTS)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const row: {
    user_id: string
    updated_at: string
    email_reports?: boolean
    email_updates?: boolean
    timezone?: string
  } = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }

  if (typeof body.email_reports === 'boolean') row.email_reports = body.email_reports
  if (typeof body.email_updates === 'boolean') row.email_updates = body.email_updates
  if (typeof body.timezone === 'string') row.timezone = body.timezone

  const { error } = await supabase
    .from('user_preferences')
    .upsert(row as never, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
