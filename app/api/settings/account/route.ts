import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { confirm } = await request.json()
  if (confirm !== 'DELETE') {
    return NextResponse.json(
      { error: 'You must send { confirm: "DELETE" } to delete your account' },
      { status: 400 }
    )
  }

  // Delete user from auth (cascades clean up profiles and related tables)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
