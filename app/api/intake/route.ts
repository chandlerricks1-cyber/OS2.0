import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamIntakeResponse, parseIntakeCompletion } from '@/lib/claude/intake'
import { calculateDerivedMetrics } from '@/lib/utils/metrics'
import { generateCrucibleOffers } from '@/lib/claude/offers'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Bug Fix 3: Pre-flight validation before any streaming ─────────────
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set')
    return NextResponse.json(
      { error: 'AI service is not configured. Please contact support.' },
      { status: 503 }
    )
  }

  // ── Parse body ────────────────────────────────────────────────────────
  let messages: Array<{ role: 'user' | 'assistant'; content: string }>
  let sessionId: string | null
  try {
    const body = await req.json()
    messages = body.messages ?? []
    sessionId = body.sessionId ?? null
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // ── Session management ────────────────────────────────────────────────
  let currentSessionId = sessionId
  if (!currentSessionId) {
    const { data: existing } = await supabase
      .from('intake_sessions')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      currentSessionId = existing.id
    } else {
      const { data: newSession, error } = await supabase
        .from('intake_sessions')
        .insert({ user_id: user.id })
        .select('id')
        .single()

      if (error || !newSession) {
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
      }
      currentSessionId = newSession.id
    }
  }

  // ── Save the last user message ────────────────────────────────────────
  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role === 'user') {
    await supabase.from('intake_messages').insert({
      session_id: currentSessionId,
      role: 'user',
      content: lastMessage.content,
    })
  }

  const isFirstMessage = messages.length === 0

  // ── Bug Fix 3: Create Gemini generator BEFORE creating the ReadableStream ─
  // If the SDK throws here (bad key, network error), we can return a clean
  // JSON error response because the HTTP response hasn't been committed yet.
  let geminiStream: AsyncGenerator<string>
  try {
    geminiStream = streamIntakeResponse(messages, isFirstMessage)
  } catch (err) {
    console.error('Gemini initialization error:', err)
    return NextResponse.json(
      { error: 'Failed to connect to AI service. Please try again.' },
      { status: 502 }
    )
  }

  // ── Stream response ───────────────────────────────────────────────────
  const encoder = new TextEncoder()
  let fullResponse = ''

  // Capture in closure to avoid stale references inside the stream
  const capturedUserId = user.id
  const capturedSessionId = currentSessionId

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of geminiStream) {
          fullResponse += chunk
          controller.enqueue(encoder.encode(chunk))
        }

        // Save assistant message
        await supabase.from('intake_messages').insert({
          session_id: capturedSessionId,
          role: 'assistant',
          content: fullResponse,
        })

        // Check for completion signal
        const extracted = parseIntakeCompletion(fullResponse)
        if (extracted) {
          const derived = calculateDerivedMetrics(extracted)

          const { error: upsertError } = await supabase.from('business_metrics').upsert({
            user_id: capturedUserId,
            cac: extracted.cac ?? null,
            ltv: extracted.ltv ?? null,
            gross_profit_per_customer: extracted.gross_profit_per_customer ?? null,
            cash_collected_first_30_days: extracted.cash_collected_first_30_days ?? null,
            monthly_revenue: extracted.monthly_revenue ?? null,
            monthly_new_customers: extracted.monthly_new_customers ?? null,
            close_rate: extracted.close_rate ?? null,
            ltv_cac_ratio: derived.ltv_cac_ratio ?? null,
            cac_payback_months: derived.cac_payback_months ?? null,
            required_30_day_revenue: derived.required_30_day_revenue ?? null,
            business_type: extracted.business_type ?? null,
            industry: extracted.industry ?? null,
            primary_offers: extracted.primary_offers ?? null,
            cro_blockers: extracted.cro_blockers ?? null,
            extraction_confidence: extracted.extraction_confidence ?? null,
            raw_extraction: extracted as Record<string, unknown>,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })

          if (upsertError) {
            // Log but don't abort — messages are already saved
            console.error('Failed to save metrics:', upsertError.message)
          } else {
            await supabase.from('intake_sessions').update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            }).eq('id', capturedSessionId)

            controller.enqueue(encoder.encode('\n\n[CRUCIBLE_COMPLETE]'))

            // Fire-and-forget: generate Crucible Approved offer ideas
            seedCrucibleOffers(
              capturedUserId,
              extracted as unknown as Record<string, unknown>,
              derived as Record<string, unknown>,
              capturedSessionId!
            ).catch((err) => {
              console.error('[Crucible Offers] generation failed:', err)
            })
          }
        }

        controller.close()
      } catch (err) {
        // Bug Fix 1: Never call controller.error() — it drops the TCP connection
        // causing "failed to fetch" on the client. Instead, send a readable error
        // sentinel so the client can display a user-friendly message and retry.
        console.error('Intake streaming error:', err)
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        controller.enqueue(encoder.encode(`\n\n[CRUCIBLE_ERROR:${message}]`))
        controller.close()
      }
    },
  })

  // Bug Fix 2: 'Transfer-Encoding': 'chunked' removed — never set this manually
  // in Next.js. HTTP/2 doesn't support it and Next.js sets it automatically.
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Session-Id': capturedSessionId,
    },
  })
}

// ── Crucible Approved Offer Generation (fire-and-forget) ────────────────
async function seedCrucibleOffers(
  userId: string,
  extracted: Record<string, unknown>,
  derived: Record<string, unknown>,
  sessionId: string
) {
  // Prevent duplicates if intake is retried
  const { count } = await supabaseAdmin
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('source', 'crucible_ai')
    .eq('is_active', true)

  if (count && count > 0) return

  // Fetch last 20 intake messages for conversational context
  const { data: msgs } = await supabaseAdmin
    .from('intake_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(20)

  const intakeMessages = (msgs ?? []).reverse().map((m) => ({
    role: m.role as string,
    content: m.content as string,
  }))

  // Build full metrics object for the prompt
  const metrics: Record<string, unknown> = { ...extracted, ...derived }

  const offers = await generateCrucibleOffers(metrics, intakeMessages)

  // Insert all 8 offers with source: 'crucible_ai'
  const rows = offers.map((o, i) => ({
    user_id: userId,
    name: o.name,
    offer_type: o.offer_type,
    price: o.price || null,
    what_customer_gets: o.what_customer_gets || null,
    why_do_it: o.why_do_it || null,
    when_offered: o.when_offered || null,
    trigger: o.trigger || null,
    sales_pitch: o.sales_pitch || null,
    sort_order: i,
    source: 'crucible_ai',
  }))

  const { error } = await supabaseAdmin.from('offers').insert(rows)
  if (error) {
    console.error('[Crucible Offers] insert failed:', error.message)
  }
}
