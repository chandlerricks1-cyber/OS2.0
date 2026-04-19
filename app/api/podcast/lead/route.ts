import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  createOpportunity,
  findStageId,
  getPodcastPipeline,
  isGhlConfigured,
  upsertContact,
} from '@/lib/ghl/client'

async function createAccountAndSignIn(admin: Awaited<ReturnType<typeof createAdminClient>>, lead: {
  full_name: string
  email: string
  phone: string
}): Promise<{ userId?: string; error?: string }> {
  try {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: lead.email,
      email_confirm: true,
      user_metadata: { full_name: lead.full_name, phone: lead.phone },
    })

    let userId = created?.user?.id
    if (createErr && !userId) {
      const msg = createErr.message?.toLowerCase() ?? ''
      const alreadyExists = msg.includes('already') || msg.includes('registered') || msg.includes('exists')
      if (!alreadyExists) return { error: createErr.message }
    }

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: lead.email,
    })
    if (linkErr || !linkData?.properties?.hashed_token) {
      return { error: linkErr?.message ?? 'Failed to generate sign-in link' }
    }
    if (!userId) userId = linkData.user?.id

    const cookieClient = await createClient()
    const { error: verifyErr } = await cookieClient.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink',
    })
    if (verifyErr) return { error: verifyErr.message }

    return { userId }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Auth failed' }
  }
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

async function pushLeadToGhl(lead: {
  full_name: string
  email: string
  phone: string
  preferred_date: string
}): Promise<{ contactId?: string; opportunityId?: string; error?: string }> {
  if (!isGhlConfigured()) return { error: 'GHL not configured' }
  try {
    const { firstName, lastName } = splitName(lead.full_name)
    const contactRes = await upsertContact({
      firstName,
      lastName,
      email: lead.email,
      phone: lead.phone,
      source: 'Podcast landing page',
      tags: ['podcast-lead'],
    })
    const contactId = contactRes.contact?.id
    if (!contactId) return { error: 'No contact id returned from GHL' }

    const pipeline = await getPodcastPipeline()
    const stageId = findStageId(pipeline, 'New Lead')

    const oppRes = await createOpportunity({
      pipelineId: pipeline.id,
      pipelineStageId: stageId,
      contactId,
      name: `${lead.full_name} — Podcast (${lead.preferred_date})`,
      status: 'open',
      source: 'Podcast landing page',
    })
    const opportunityId = oppRes.opportunity?.id ?? oppRes.id
    return { contactId, opportunityId }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'GHL push failed' }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, email, phone, preferred_date, _honey } = body

    if (_honey) {
      return NextResponse.json({ id: 'ok' }, { status: 201 })
    }

    const errors: Record<string, string> = {}
    if (!full_name?.trim()) errors.full_name = 'Name is required'
    if (!email?.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address'
    if (!phone?.trim()) errors.phone = 'Phone number is required'
    if (!preferred_date) errors.preferred_date = 'Preferred date is required'
    else {
      // Compare as date strings (YYYY-MM-DD) to avoid timezone mismatches
      const dateStr = preferred_date.slice(0, 10)
      const todayStr = new Date().toISOString().slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || dateStr < todayStr) {
        errors.preferred_date = 'Please select a future date'
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const cleanLead = {
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      preferred_date,
    }

    // Check for existing lead with same email to prevent duplicates
    const { data: existingLead } = await supabase
      .from('podcast_leads')
      .select('id, status')
      .eq('email', cleanLead.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let data: { id: string }

    if (existingLead && existingLead.status === 'new') {
      // Update existing lead instead of creating a duplicate
      await supabase
        .from('podcast_leads')
        .update({
          full_name: cleanLead.full_name,
          phone: cleanLead.phone,
          preferred_date: cleanLead.preferred_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLead.id)
      data = { id: existingLead.id }
    } else {
      const { data: newLead, error } = await supabase
        .from('podcast_leads')
        .insert(cleanLead)
        .select('id')
        .single()

      if (error) {
        console.error('Failed to insert podcast lead:', error)
        return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
      }
      data = newLead
    }

    const auth = await createAccountAndSignIn(supabase, cleanLead)
    if (auth.error) {
      console.warn('[podcast-lead] auto account creation failed:', auth.error)
    }

    const ghl = await pushLeadToGhl(cleanLead)
    if (ghl.error) {
      console.warn('[ghl] podcast lead sync failed:', ghl.error)
    } else {
      console.log('[ghl] podcast lead synced:', {
        leadId: data.id,
        contactId: ghl.contactId,
        opportunityId: ghl.opportunityId,
      })
      if (ghl.contactId || ghl.opportunityId) {
        const { error: updateErr } = await supabase
          .from('podcast_leads')
          .update({
            ghl_contact_id: ghl.contactId ?? null,
            ghl_opportunity_id: ghl.opportunityId ?? null,
          })
          .eq('id', data.id)
        if (updateErr) {
          console.warn('[ghl] failed to persist GHL ids on podcast_leads:', updateErr.message)
        }
      }
      // Propagate ghl_contact_id to profiles for Crucible Pro appointment sync
      if (ghl.contactId && auth.userId) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ ghl_contact_id: ghl.contactId })
          .eq('id', auth.userId)
        if (profileErr) {
          console.warn('[ghl] failed to set ghl_contact_id on profiles:', profileErr.message)
        }
      }
    }

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    console.error('Podcast lead error:', err)
    return NextResponse.json({ error: 'Something went wrong on our end. Please try again.' }, { status: 500 })
  }
}
