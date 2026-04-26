import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
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

// Add tag to lead
export async function POST(request: Request) {
  try {
    const user = await verifyAdmin()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { lead_id, tag } = await request.json()
    if (!lead_id || !tag?.trim()) {
      return NextResponse.json({ error: 'lead_id and tag are required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('podcast_lead_tags')
      .insert({ lead_id, tag: tag.trim(), created_by: user.id })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Tag already exists' }, { status: 409 })
      }
      console.error('Failed to add tag:', error)
      return NextResponse.json({ error: 'Failed to add tag' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Remove tag from lead
export async function DELETE(request: Request) {
  try {
    const user = await verifyAdmin()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { lead_id, tag } = await request.json()
    if (!lead_id || !tag) {
      return NextResponse.json({ error: 'lead_id and tag are required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('podcast_lead_tags')
      .delete()
      .eq('lead_id', lead_id)
      .eq('tag', tag)

    if (error) {
      console.error('Failed to remove tag:', error)
      return NextResponse.json({ error: 'Failed to remove tag' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
