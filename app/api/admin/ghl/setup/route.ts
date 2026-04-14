import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createPodcastPipeline,
  isGhlConfigured,
  listPipelines,
  PODCAST_PIPELINE_NAME,
  PODCAST_STAGE_NAMES,
} from '@/lib/ghl/client'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user }
}

export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  if (!isGhlConfigured()) {
    return NextResponse.json({ configured: false, error: 'GHL_API_KEY / GHL_LOCATION_ID missing' }, { status: 400 })
  }

  try {
    const pipelines = await listPipelines()
    const podcast = pipelines.find((p) => p.name.trim().toLowerCase() === PODCAST_PIPELINE_NAME.toLowerCase())
    return NextResponse.json({
      configured: true,
      pipelineExists: !!podcast,
      podcast: podcast ?? null,
      allPipelines: pipelines.map((p) => ({ id: p.id, name: p.name, stageCount: p.stages?.length ?? 0 })),
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  if (!isGhlConfigured()) {
    return NextResponse.json({ error: 'GHL_API_KEY / GHL_LOCATION_ID missing in .env.local' }, { status: 400 })
  }

  try {
    const existing = await listPipelines()
    const already = existing.find((p) => p.name.trim().toLowerCase() === PODCAST_PIPELINE_NAME.toLowerCase())
    if (already) {
      return NextResponse.json({
        created: false,
        message: 'Podcast pipeline already exists',
        pipeline: already,
      })
    }

    const created = await createPodcastPipeline()
    return NextResponse.json({ created: true, pipeline: created })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      {
        error: msg,
        manualInstructions: {
          message:
            'GHL API refused pipeline creation. Create the pipeline manually in GHL (Opportunities → Pipelines → New Pipeline) using the name and stages below, then re-run this endpoint.',
          pipelineName: PODCAST_PIPELINE_NAME,
          stages: PODCAST_STAGE_NAMES,
        },
      },
      { status: 500 }
    )
  }
}
