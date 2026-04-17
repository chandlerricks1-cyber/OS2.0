import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: profile }, { data: metrics }, { data: reports }, { data: preferences }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('business_metrics').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('reports').select('*').eq('user_id', user.id),
      supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle(),
    ])

  const exportData = {
    exported_at: new Date().toISOString(),
    profile,
    business_metrics: metrics,
    reports: reports ?? [],
    preferences,
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="crucible-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
