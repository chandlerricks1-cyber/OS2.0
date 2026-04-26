import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateBrandScript } from '@/lib/podcast/brand-script'
import { normalizePhone } from '@/lib/utils/phone'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, email, phone, _honey, ...answers } = body

    if (_honey) {
      return NextResponse.json({ success: true }, { status: 201 })
    }

    const errors: Record<string, string> = {}
    if (!full_name?.trim()) errors.full_name = 'Required'
    if (!email?.trim()) errors.email = 'Required'
    if (!phone?.trim()) errors.phone = 'Required'
    if (!answers.hero?.trim()) errors.hero = 'Required'
    if (!answers.external_problem?.trim()) errors.external_problem = 'Required'
    if (!answers.empathy?.trim()) errors.empathy = 'Required'
    if (!answers.the_win?.trim()) errors.the_win = 'Required'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 })
    }

    const supabase = supabaseAdmin
    const normalized = normalizePhone(phone)

    let matched_ghl_contact_id: string | null = null
    let matched_podcast_lead_id: string | null = null

    if (normalized) {
      const phoneFilter = `phone.eq.${normalized},phone.eq.+1${normalized},phone.eq.1${normalized},phone.eq.+${normalized}`

      const { data: ghlMatch } = await supabase
        .from('ghl_contacts')
        .select('ghl_id, phone')
        .or(phoneFilter)
        .limit(50)

      if (ghlMatch && ghlMatch.length > 0) {
        const exact = ghlMatch.find((c) => normalizePhone(c.phone) === normalized)
        if (exact) matched_ghl_contact_id = exact.ghl_id
      }

      const { data: leadMatch } = await supabase
        .from('podcast_leads')
        .select('id, phone')
        .or(phoneFilter)
        .limit(50)

      if (leadMatch && leadMatch.length > 0) {
        const exact = leadMatch.find((l) => normalizePhone(l.phone) === normalized)
        if (exact) matched_podcast_lead_id = exact.id
      }
    }

    const { data: inserted, error: insertError } = await supabase
      .from('brand_scripts')
      .insert({
        full_name: full_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        matched_ghl_contact_id,
        matched_podcast_lead_id,
        hero: answers.hero?.trim() || null,
        external_problem: answers.external_problem?.trim() || null,
        internal_problem: answers.internal_problem?.trim() || null,
        whats_at_stake: answers.whats_at_stake?.trim() || null,
        empathy: answers.empathy?.trim() || null,
        authority: answers.authority?.trim() || null,
        plan_step_1: answers.plan_step_1?.trim() || null,
        plan_step_2: answers.plan_step_2?.trim() || null,
        plan_step_3: answers.plan_step_3?.trim() || null,
        the_win: answers.the_win?.trim() || null,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error('Failed to insert brand_scripts row:', insertError)
      return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
    }

    const brandScript = await generateBrandScript(answers)

    if (brandScript) {
      await supabase
        .from('brand_scripts')
        .update({ brand_script: brandScript })
        .eq('id', inserted.id)
    }

    return NextResponse.json(
      {
        success: true,
        brand_script: brandScript,
        ai_error: !brandScript,
        matched: Boolean(matched_ghl_contact_id || matched_podcast_lead_id),
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Brand script error:', err)
    return NextResponse.json(
      { error: 'Something went wrong on our end. Please try again.' },
      { status: 500 }
    )
  }
}
