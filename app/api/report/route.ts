import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateReport } from '@/lib/claude/report'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const refresh = req.nextUrl.searchParams.get('refresh') === 'true'

  // Return cached report if exists (unless refresh requested)
  if (!refresh) {
    const { data: existingReport } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingReport) {
      return NextResponse.json({ report: existingReport })
    }
  }

  // Get metrics
  const { data: metrics } = await supabase
    .from('business_metrics')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!metrics) {
    return NextResponse.json({ error: 'No metrics found. Complete the intake first.' }, { status: 400 })
  }

  // Get intake messages for context
  const { data: session } = await supabase
    .from('intake_sessions')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const intakeMessages: Array<{ role: string; content: string }> = []
  if (session) {
    const { data: messages } = await supabase
      .from('intake_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(20)

    if (messages) {
      intakeMessages.push(...messages)
    }
  }

  try {
    const content = await generateReport(metrics, intakeMessages)

    const { data: report, error } = await supabase
      .from('reports')
      .upsert({
        user_id: user.id,
        content,
        generated_at: new Date().toISOString(),
        model_version: 'gemini-2.5-flash',
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ report })
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err)
    console.error('Report generation error:', message)
    return NextResponse.json({ error: `Failed to generate report: ${message}` }, { status: 500 })
  }
}
