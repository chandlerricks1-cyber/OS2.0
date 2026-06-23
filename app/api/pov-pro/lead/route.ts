import { NextResponse } from 'next/server'
import {
  createOpportunity,
  findStageId,
  getPovProPipeline,
  isGhlConfigured,
  upsertContact,
} from '@/lib/ghl/client'

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

async function pushLeadToGhl(lead: {
  full_name: string
  email: string
  phone: string
  role: string
  company: string
}): Promise<{ contactId?: string; opportunityId?: string; error?: string }> {
  if (!isGhlConfigured()) return { error: 'GHL not configured' }
  try {
    const { firstName, lastName } = splitName(lead.full_name)
    const contactRes = await upsertContact({
      firstName,
      lastName,
      email: lead.email,
      phone: lead.phone,
      source: 'POV Pro Prelaunch',
      tags: ['pov-pro-prelaunch', 'tradesman'],
    })
    const contactId = contactRes.contact?.id
    if (!contactId) return { error: 'No contact id returned from GHL' }

    const pipeline = await getPovProPipeline()
    const stageId = findStageId(pipeline, 'New Lead')

    const oppParts = [lead.role, lead.company].map((p) => p.trim()).filter(Boolean)
    const oppSuffix = oppParts.length ? ` — ${oppParts.join(', ')}` : ''

    const oppRes = await createOpportunity({
      pipelineId: pipeline.id,
      pipelineStageId: stageId,
      contactId,
      name: `${lead.full_name} — POV Pro Prelaunch${oppSuffix}`,
      status: 'open',
      source: 'POV Pro Prelaunch',
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
    const { full_name, email, phone, role, company, _honey } = body

    // Honeypot — silently accept bot submissions without doing anything.
    if (_honey) {
      return NextResponse.json({ ok: true }, { status: 201 })
    }

    const errors: Record<string, string> = {}
    if (!full_name?.trim()) errors.full_name = 'Name is required'
    if (!email?.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address'
    if (!phone?.trim()) errors.phone = 'Phone number is required'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 })
    }

    const cleanLead = {
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: typeof role === 'string' ? role.trim() : '',
      company: typeof company === 'string' ? company.trim() : '',
    }

    const ghl = await pushLeadToGhl(cleanLead)
    if (ghl.error) {
      console.warn('[ghl] POV Pro prelaunch lead sync failed:', ghl.error)
    } else {
      console.log('[ghl] POV Pro prelaunch lead synced:', {
        contactId: ghl.contactId,
        opportunityId: ghl.opportunityId,
      })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('POV Pro prelaunch lead error:', err)
    return NextResponse.json({ error: 'Something went wrong on our end. Please try again.' }, { status: 500 })
  }
}
