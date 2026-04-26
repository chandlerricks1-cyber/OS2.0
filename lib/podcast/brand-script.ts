import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface BrandScriptAnswers {
  hero?: string
  external_problem?: string
  internal_problem?: string
  whats_at_stake?: string
  empathy?: string
  authority?: string
  plan_step_1?: string
  plan_step_2?: string
  plan_step_3?: string
  the_win?: string
}

export function buildBrandScriptPrompt(answers: BrandScriptAnswers): string {
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

export async function generateBrandScript(answers: BrandScriptAnswers): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = buildBrandScriptPrompt(answers)
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    return text.replace(/^["']|["']$/g, '').trim() || null
  } catch (err) {
    console.error('[brand-script] Gemini brand script generation failed:', err)
    return null
  }
}
