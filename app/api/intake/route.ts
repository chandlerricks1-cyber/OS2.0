import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamIntakeResponse, parseIntakeCompletion } from '@/lib/claude/intake'
import { calculateDerivedMetrics } from '@/lib/utils/metrics'

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
