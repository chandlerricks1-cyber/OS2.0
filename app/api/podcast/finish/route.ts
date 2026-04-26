import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { ensureSignedIn } from '@/lib/podcast/auto-signin'
import { seedBusinessMetricsFromPodcast } from '@/lib/podcast/seed-metrics'
import { isGhlConfigured, upsertContact } from '@/lib/ghl/client'

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      lead_id,
      full_name,
      email,
      phone,
      password,
      _honey,
    } = body as Record<string, string | undefined>

    if (_honey) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const errors: Record<string, string> = {}
    if (!lead_id) errors.lead_id = 'Missing booking reference'
    if (!full_name?.trim()) errors.full_name = 'Name is required'
    if (!email?.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address'
    if (!phone?.trim()) errors.phone = 'Phone number is required'
    if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 })
    }

    const cleanName = full_name!.trim()
    const cleanEmail = email!.trim().toLowerCase()
    const cleanPhone = phone!.trim()

    // 1. Load the lead
    const { data: lead } = await supabaseAdmin
      .from('podcast_leads')
      .select('id, full_name, email, phone, ghl_contact_id')
      .eq('id', lead_id!)
      .single()

    if (!lead) {
      return NextResponse.json(
        { error: 'We couldn\'t find your booking. Please go back to the podcast page and book your episode again.' },
        { status: 400 }
      )
    }

    // 2. Resolve the user — try cookie session first, fall back to magiclink-OTP
    const cookieClient = await createClient()
    const { data: { user: cookieUser } } = await cookieClient.auth.getUser()

    let userId = cookieUser?.id
    let alreadyHadPassword = false

    if (!userId) {
      const auth = await ensureSignedIn({
        email: lead.email,
        fullName: lead.full_name,
        phone: lead.phone ?? undefined,
      })
      if (auth.error || !auth.userId) {
        return NextResponse.json(
          { error: 'We couldn\'t sign you in. Please try the login page.' },
          { status: 500 }
        )
      }
      userId = auth.userId
      alreadyHadPassword = !!auth.alreadyHadPassword
    } else {
      // Cookie user already in session — still check whether they have a real
      // password identity so we don't clobber it.
      try {
        const { data } = await supabaseAdmin.auth.admin.getUserById(userId)
        const identities = data?.user?.identities ?? []
        alreadyHadPassword = identities.some((identity) => {
          if (identity.provider !== 'email') return false
          const last = identity.last_sign_in_at ? new Date(identity.last_sign_in_at).getTime() : 0
          const created = identity.created_at ? new Date(identity.created_at).getTime() : 0
          return last > 0 && Math.abs(last - created) > 60_000
        })
      } catch {
        alreadyHadPassword = false
      }
    }

    if (alreadyHadPassword) {
      return NextResponse.json(
        {
          error: 'An account already exists for this email. Please log in instead.',
          redirect: `/login?email=${encodeURIComponent(lead.email)}`,
        },
        { status: 409 }
      )
    }

    // 3. Email change: validate it's not taken, propagate to auth/profiles/leads
    const emailChanged = cleanEmail !== lead.email.toLowerCase()
    if (emailChanged) {
      const { data: takenProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .neq('id', userId)
        .maybeSingle()
      if (takenProfile) {
        return NextResponse.json(
          { error: 'That email is already in use.', fields: { email: 'That email is already in use.' } },
          { status: 409 }
        )
      }

      const { error: emailUpdateErr } = await supabaseAdmin.auth.admin.updateUserById(userId!, {
        email: cleanEmail,
        email_confirm: true,
      })
      if (emailUpdateErr) {
        console.warn('[podcast-finish] auth email update failed:', emailUpdateErr.message)
        return NextResponse.json(
          { error: 'Failed to update email.', fields: { email: emailUpdateErr.message } },
          { status: 500 }
        )
      }
    }

    // 4. Set password + sync user_metadata
    const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(userId!, {
      password,
      user_metadata: { full_name: cleanName, phone: cleanPhone },
    })
    if (pwErr) {
      console.warn('[podcast-finish] password update failed:', pwErr.message)
      return NextResponse.json({ error: 'Failed to set password. Please try again.' }, { status: 500 })
    }

    // 5. Update profiles
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: cleanName,
        phone: cleanPhone,
        ...(emailChanged ? { email: cleanEmail } : {}),
      })
      .eq('id', userId!)
    if (profileErr) {
      console.warn('[podcast-finish] profile update failed:', profileErr.message)
    }

    // 6. Update podcast_leads to reflect any field edits
    const { error: leadUpdateErr } = await supabaseAdmin
      .from('podcast_leads')
      .update({
        full_name: cleanName,
        phone: cleanPhone,
        updated_at: new Date().toISOString(),
        ...(emailChanged ? { email: cleanEmail } : {}),
      })
      .eq('id', lead_id!)
    if (leadUpdateErr) {
      console.warn('[podcast-finish] lead update failed:', leadUpdateErr.message)
    }

    // 7. GHL sync — push name/phone/email changes
    const nameChanged = cleanName !== lead.full_name
    const phoneChanged = cleanPhone !== (lead.phone ?? '')
    if (isGhlConfigured() && (nameChanged || phoneChanged || emailChanged)) {
      try {
        const { firstName, lastName } = splitName(cleanName)
        await upsertContact({
          firstName,
          lastName,
          email: cleanEmail,
          phone: cleanPhone,
          source: 'Podcast finalize',
        })
      } catch (ghlErr) {
        console.warn('[podcast-finish] GHL upsert failed:', ghlErr instanceof Error ? ghlErr.message : ghlErr)
      }
    }

    // 8. Re-seed business_metrics in case intake answers were edited or first
    // seed failed. Idempotent upsert keyed on user_id.
    const seedRes = await seedBusinessMetricsFromPodcast(userId!, lead_id!)
    if (!seedRes.seeded) {
      console.warn('[podcast-finish] metrics seed skipped:', seedRes.reason)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Podcast finish error:', err)
    return NextResponse.json({ error: 'Something went wrong on our end. Please try again.' }, { status: 500 })
  }
}
