import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateBrandScript } from '@/lib/podcast/brand-script'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lead_id, _honey, ...answers } = body

    // Honeypot spam check
    if (_honey) {
      return NextResponse.json({ success: true }, { status: 201 })
    }

    // Validate required fields
    const errors: Record<string, string> = {}
    if (!lead_id) errors.lead_id = 'Missing lead reference'
    if (!answers.hero?.trim()) errors.hero = 'This field is required'
    if (!answers.external_problem?.trim()) errors.external_problem = 'This field is required'
    if (!answers.empathy?.trim()) errors.empathy = 'This field is required'
    if (!answers.the_win?.trim()) errors.the_win = 'This field is required'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 })
    }

    const supabase = supabaseAdmin

    // Verify the lead exists
    const { data: lead } = await supabase
      .from('podcast_leads')
      .select('id')
      .eq('id', lead_id)
      .single()

    if (!lead) {
      return NextResponse.json(
        { error: 'We couldn\'t find your booking. Please go back to the podcast page and book your episode again.' },
        { status: 400 }
      )
    }

    // Check if guest prep already submitted for this lead
    const { data: existingPrep } = await supabase
      .from('podcast_guest_prep')
      .select('id, brand_script')
      .eq('lead_id', lead_id)
      .maybeSingle()

    if (existingPrep) {
      return NextResponse.json(
        { success: true, brand_script: existingPrep.brand_script },
        { status: 200 }
      )
    }

    // Insert guest prep answers
    const { error: insertError } = await supabase
      .from('podcast_guest_prep')
      .insert({
        lead_id,
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

    if (insertError) {
      console.error('Failed to insert podcast guest prep:', insertError)
      return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
    }

    // Generate brand script with Gemini
    const brandScript = await generateBrandScript(answers)

    if (brandScript) {
      await supabase
        .from('podcast_guest_prep')
        .update({ brand_script: brandScript })
        .eq('lead_id', lead_id)
    }

    return NextResponse.json(
      { success: true, brand_script: brandScript, ai_error: !brandScript },
      { status: 201 }
    )
  } catch (err) {
    console.error('Podcast guest prep error:', err)
    return NextResponse.json(
      { error: 'Something went wrong on our end. Please try again.' },
      { status: 500 }
    )
  }
}
