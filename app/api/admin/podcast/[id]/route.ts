import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return profile?.role === 'admin' ? user : null
}

// Update lead contact info
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdmin()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const { full_name, email, phone, preferred_date } = body

    const updates: Record<string, string> = { updated_at: new Date().toISOString() }
    if (full_name !== undefined) updates.full_name = full_name.trim()
    if (email !== undefined) updates.email = email.trim().toLowerCase()
    if (phone !== undefined) updates.phone = phone.trim()
    if (preferred_date !== undefined) updates.preferred_date = preferred_date

    const admin = await createAdminClient()
    const { error } = await admin
      .from('podcast_leads')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Failed to update lead:', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Delete lead
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdmin()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const admin = await createAdminClient()

    const { error } = await admin
      .from('podcast_leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete lead:', error)
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
