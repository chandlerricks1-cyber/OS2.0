import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const updates: {
    company_name?: string | null
    website?: string | null
    industry?: string | null
    business_type?: string | null
  } = {}

  if (body.company_name !== undefined) updates.company_name = typeof body.company_name === 'string' ? body.company_name.trim() : body.company_name
  if (body.website !== undefined) updates.website = typeof body.website === 'string' ? body.website.trim() : body.website
  if (body.industry !== undefined) updates.industry = typeof body.industry === 'string' ? body.industry.trim() : body.industry
  if (body.business_type !== undefined) updates.business_type = typeof body.business_type === 'string' ? body.business_type.trim() : body.business_type

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('business_metrics')
    .update(updates as never)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
