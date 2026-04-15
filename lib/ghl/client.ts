const API_BASE = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'

export const PODCAST_PIPELINE_NAME = 'Podcast Funnel'
export const PODCAST_STAGE_NAMES = [
  'New Lead',
  'Intake Submitted',
  'Episode Booked',
  'Episode Completed',
  'Closed/Won',
  'Lost',
  'Not Qualified',
  'Not Interested',
] as const

export type PodcastStageName = (typeof PODCAST_STAGE_NAMES)[number]

export interface GhlStage {
  id: string
  name: string
  position?: number
}

export interface GhlPipeline {
  id: string
  name: string
  stages: GhlStage[]
}

function getConfig() {
  const apiKey = process.env.GHL_API_KEY
  const locationId = process.env.GHL_LOCATION_ID
  if (!apiKey || !locationId) {
    throw new Error('GHL not configured — set GHL_API_KEY and GHL_LOCATION_ID in .env.local')
  }
  return { apiKey, locationId }
}

export function isGhlConfigured(): boolean {
  return !!(process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID)
}

async function ghlFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const { apiKey } = getConfig()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: API_VERSION,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const msg = typeof data === 'object' && data && 'message' in data ? (data as { message: string }).message : text
    const err = new Error(`GHL ${res.status}: ${msg || 'request failed'}`)
    // @ts-expect-error attach response data for upstream logging
    err.status = res.status
    // @ts-expect-error
    err.data = data
    throw err
  }
  return data as T
}

export async function listPipelines(): Promise<GhlPipeline[]> {
  const { locationId } = getConfig()
  const data = await ghlFetch<{ pipelines: GhlPipeline[] }>(
    `/opportunities/pipelines?locationId=${encodeURIComponent(locationId)}`
  )
  return data.pipelines ?? []
}

export async function createPodcastPipeline(): Promise<GhlPipeline> {
  const { locationId } = getConfig()
  const body = {
    name: PODCAST_PIPELINE_NAME,
    locationId,
    stages: PODCAST_STAGE_NAMES.map((name, i) => ({ name, position: i })),
  }
  const data = await ghlFetch<{ pipeline?: GhlPipeline } & GhlPipeline>(`/opportunities/pipelines`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return (data.pipeline ?? data) as GhlPipeline
}

let pipelineCache: { pipeline: GhlPipeline; at: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000

export async function getPodcastPipeline(forceRefresh = false): Promise<GhlPipeline> {
  const now = Date.now()
  if (!forceRefresh && pipelineCache && now - pipelineCache.at < CACHE_TTL_MS) {
    return pipelineCache.pipeline
  }
  const pipelines = await listPipelines()
  const match = pipelines.find((p) => p.name.trim().toLowerCase() === PODCAST_PIPELINE_NAME.toLowerCase())
  if (!match) {
    throw new Error(
      `GHL pipeline "${PODCAST_PIPELINE_NAME}" not found. Hit POST /api/admin/ghl/setup to create it, or create it manually in GHL.`
    )
  }
  pipelineCache = { pipeline: match, at: now }
  return match
}

export function findStageId(pipeline: GhlPipeline, stageName: PodcastStageName): string {
  const stage = pipeline.stages.find((s) => s.name.trim().toLowerCase() === stageName.toLowerCase())
  if (!stage) {
    throw new Error(`Stage "${stageName}" not found in GHL pipeline "${pipeline.name}"`)
  }
  return stage.id
}

export interface UpsertContactInput {
  firstName?: string
  lastName?: string
  name?: string
  email: string
  phone?: string
  tags?: string[]
  source?: string
  customFields?: Array<{ id?: string; key?: string; field_value: string | number | boolean }>
}

export interface UpsertContactResponse {
  contact?: { id: string; email?: string }
  new?: boolean
}

export async function upsertContact(input: UpsertContactInput): Promise<UpsertContactResponse> {
  const { locationId } = getConfig()
  return ghlFetch<UpsertContactResponse>(`/contacts/upsert`, {
    method: 'POST',
    body: JSON.stringify({ ...input, locationId }),
  })
}

export interface CreateOpportunityInput {
  pipelineId: string
  pipelineStageId: string
  contactId: string
  name: string
  status?: 'open' | 'won' | 'lost' | 'abandoned'
  monetaryValue?: number
  source?: string
}

export interface CreateOpportunityResponse {
  opportunity?: { id: string }
  id?: string
}

export async function createOpportunity(input: CreateOpportunityInput): Promise<CreateOpportunityResponse> {
  const { locationId } = getConfig()
  const body = { status: 'open' as const, ...input, locationId }
  return ghlFetch<CreateOpportunityResponse>(`/opportunities/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export interface UpdateOpportunityInput {
  pipelineStageId?: string
  name?: string
  status?: 'open' | 'won' | 'lost' | 'abandoned'
  monetaryValue?: number
}

export async function updateOpportunity(
  opportunityId: string,
  input: UpdateOpportunityInput
): Promise<CreateOpportunityResponse> {
  return ghlFetch<CreateOpportunityResponse>(`/opportunities/${opportunityId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export interface AddContactNoteInput {
  contactId: string
  body: string
  userId?: string
}

export async function addContactNote(input: AddContactNoteInput): Promise<{ note?: { id: string } }> {
  return ghlFetch(`/contacts/${input.contactId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ body: input.body, userId: input.userId }),
  })
}
