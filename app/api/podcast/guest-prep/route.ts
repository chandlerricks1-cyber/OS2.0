import { supabaseAdmin } from '@/lib/supabase/admin'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function buildBrandScriptPrompt(answers: Record<string, string>): string {
  return `You are a StoryBrand-certified copywriter helping a pest control or home services business owner craft their brand script for a podcast episode.

Using the following inputs, write a natural-sounding 60-90 second brand script. Use this template as a guide but make it flow naturally — it should sound like something a real person would say on a podcast, not a fill-in-the-blank exercise:

"Most of our customers come to us because [EXTERNAL PROBLEM]. And I get it — [EMPATHY]. What people don't realize is that if they wait, [WHAT'S AT STAKE]. We've [AUTHORITY], so we know what works. The process is simple: [STEP 1], [STEP 2], [STEP 3]. And at the end of the day, our customers [THE WIN]."

Here are the business owner's inputs:

- Hero (their typical customer): ${answers.hero}
- External Problem: ${answers.external_problem}
- Internal Problem: ${answers.internal_problem || 'Not provided'}
- What's At Stake: ${answers.whats_at_stake || 'Not provided'}
- Empathy statement: ${answers.empathy}
- Authority statement: ${answers.authority || 'Not provided'}
- Plan Step 1: ${answers.plan_step_1}
- Plan Step 2: ${answers.plan_step_2 || 'Not provided'}
- Plan Step 3: ${answers.plan_step_3 || 'Not provided'}
- The Win (happy ending): ${answers.the_win}

Return ONLY the brand script text. No quotes around it, no preamble, no explanation, no labels. Just the script itself, ready to be read aloud.`
}

async function generateBrandScript(answers: Record<string, string>): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = buildBrandScriptPrompt(answers)
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    // Strip surrounding quotes if the model wraps them
    return text.replace(/^["']|["']$/g, '').trim() || null
  } catch (err) {
    console.error('[guest-prep] Gemini brand script generation failed:', err)
    return null
  }
}

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
