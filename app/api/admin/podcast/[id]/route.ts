import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

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

    const updates: { updated_at: string; full_name?: string; email?: string; phone?: string; preferred_date?: string } = { updated_at: new Date().toISOString() }
    if (full_name !== undefined) updates.full_name = full_name.trim()
    if (email !== undefined) updates.email = email.trim().toLowerCase()
    if (phone !== undefined) updates.phone = phone.trim()
    if (preferred_date !== undefined) updates.preferred_date = preferred_date

    const { error } = await supabaseAdmin
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

    // Delete related rows first (foreign keys may not cascade)
    await supabaseAdmin.from('podcast_intake').delete().eq('lead_id', id)
    await supabaseAdmin.from('podcast_lead_tags').delete().eq('lead_id', id)

    const { error, count } = await supabaseAdmin
      .from('podcast_leads')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) {
      console.error('Failed to delete lead:', error)
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }

    if (!count) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    revalidatePath('/dashboard/admin/podcast')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
