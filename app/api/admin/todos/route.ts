import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true as const, adminId: user.id }
}

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('crucible_tasks')
    .select('*, owner:profiles!crucible_tasks_user_id_fkey(id, full_name, email, role)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tasks: data ?? [] })
}

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const body = await request.json().catch(() => ({}))
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const userId = typeof body.user_id === 'string' ? body.user_id : ''
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (!userId) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })

  const admin = await createAdminClient()

  if (userId !== guard.adminId) {
    const { data: target } = await admin
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single()
    if (!target || target.role !== 'client') {
      return NextResponse.json({ error: 'Invalid client' }, { status: 400 })
    }
  }

  const { data, error } = await admin
    .from('crucible_tasks')
    .insert({ user_id: userId, title, status: 'new' } as never)
    .select('*, owner:profiles!crucible_tasks_user_id_fkey(id, full_name, email, role)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data }, { status: 201 })
}
