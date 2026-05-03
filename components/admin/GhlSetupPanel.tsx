'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react'

interface PipelineStage {
  id: string
  name: string
  position?: number
}

interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
}

interface StatusResponse {
  configured: boolean
  pipelineExists?: boolean
  podcast?: Pipeline | null
  allPipelines?: Array<{ id: string; name: string; stageCount: number }>
  error?: string
}

interface SetupResponse {
  created?: boolean
  message?: string
  pipeline?: Pipeline
  error?: string
  manualInstructions?: {
    message: string
    pipelineName: string
    stages: string[]
  }
}

interface WebhookStatus {
  url: string
  secretConfigured: boolean
  events: string[]
  configured: boolean
  configuredAt: string | null
}

interface BackfillEntityState {
  done: boolean
  cursor: string | null
  syncedCount: number
  total: number | null
  startedAt: string
  updatedAt: string
  lastError?: string | null
}

interface BackfillStatus {
  entities: Record<string, BackfillEntityState | null>
}

const BACKFILL_ENTITIES = ['contacts', 'pipelines', 'opportunities', 'calendars', 'appointments', 'conversations'] as const

export function GhlSetupPanel() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<SetupResponse | null>(null)

  async function loadStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ghl/setup')
      const data = (await res.json()) as StatusResponse
      setStatus(data)
    } catch (err) {
      setStatus({ configured: false, error: err instanceof Error ? err.message : 'Failed to check status' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  async function createPipeline() {
    setCreating(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/ghl/setup', { method: 'POST' })
      const data = (await res.json()) as SetupResponse
      setResult(data)
      await loadStatus()
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Request failed' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">GoHighLevel</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Sync podcast leads into your GHL Opportunities pipeline
            </p>
          </div>
          <button
            onClick={loadStatus}
            disabled={loading}
            className="text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading && !status && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Checking GHL connection…
          </div>
        )}

        {status && !status.configured && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Not configured</p>
                <p className="mt-1">Add <code className="bg-amber-100 px-1 rounded">GHL_API_KEY</code> and <code className="bg-amber-100 px-1 rounded">GHL_LOCATION_ID</code> to <code className="bg-amber-100 px-1 rounded">.env.local</code>, then restart the dev server.</p>
                {status.error && <p className="mt-2 text-xs text-amber-800">{status.error}</p>}
              </div>
            </div>
          </div>
        )}

        {status && status.configured && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">GHL credentials detected</span>
            </div>

            {status.pipelineExists && status.podcast ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-900">
                      Podcast pipeline is live
                    </p>
                    <p className="text-xs text-green-800 mt-1">
                      New leads from <code>/podcast</code> will land in the &quot;New Lead&quot; stage automatically.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {status.podcast.stages.map((s) => (
                        <span
                          key={s.id}
                          className="text-xs bg-white text-green-800 border border-green-200 rounded-full px-2.5 py-0.5"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-700 mb-3">
                  No &quot;Podcast&quot; pipeline found in your GHL account. Click below to create it with
                  all 8 stages.
                </p>
                <button
                  onClick={createPipeline}
                  disabled={creating}
                  className="btn-gradient px-5 py-2.5 inline-flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                  ) : (
                    <>Create Podcast Pipeline</>
                  )}
                </button>
              </div>
            )}

            {result && result.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-red-900">Creation failed</p>
                    <p className="text-red-800 mt-1 text-xs break-words">{result.error}</p>
                    {result.manualInstructions && (
                      <div className="mt-3 bg-white border border-red-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-900 mb-2">Create it manually:</p>
                        <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                          <li>Open GHL → Opportunities → Pipelines → <strong>+ New Pipeline</strong></li>
                          <li>Name it <strong>{result.manualInstructions.pipelineName}</strong></li>
                          <li>Add these stages in order:</li>
                        </ol>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {result.manualInstructions.stages.map((s) => (
                            <span key={s} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5">
                              {s}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Then click refresh ↻ above.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result && !result.error && result.created && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Pipeline created! Any new podcast form submissions will sync automatically.</p>
              </div>
            )}

            {status.allPipelines && status.allPipelines.length > 0 && (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">
                  All GHL pipelines ({status.allPipelines.length})
                </summary>
                <ul className="mt-2 space-y-1 pl-4">
                  {status.allPipelines.map((p) => (
                    <li key={p.id}>
                      {p.name} <span className="text-gray-400">· {p.stageCount} stages</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <a
              href="https://app.gohighlevel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
            >
              Open GHL <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      <WebhookSetupCard />
      <BackfillCard />
    </div>
  )
}

function WebhookSetupCard() {
  const [data, setData] = useState<WebhookStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ghl/webhooks/register')
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function markConfigured() {
    setSaving(true)
    try {
      await fetch('/api/admin/ghl/webhooks/register', { method: 'POST' })
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function reset() {
    if (!confirm('Mark webhooks as not configured? You\'ll need to re-confirm them in GHL.')) return
    setSaving(true)
    try {
      await fetch('/api/admin/ghl/webhooks/register', { method: 'DELETE' })
      await load()
    } finally {
      setSaving(false)
    }
  }

  function copyUrl() {
    if (!data) return
    navigator.clipboard.writeText(data.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Webhooks</h2>
      <p className="text-sm text-gray-500 mb-4">
        Real-time sync from GoHighLevel into Crucible OS. Set this up once in your GHL Workflow Triggers.
      </p>

      {loading || !data ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Webhook URL</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 min-w-0 truncate text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono">
                {data.url}
              </code>
              <button
                onClick={copyUrl}
                className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm inline-flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {data.secretConfigured ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">GHL_WEBHOOK_SECRET</code> configured —
                  signature verification active
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800">
                  Add <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded">GHL_WEBHOOK_SECRET</code> to .env
                  to require signed webhooks (currently accepting unsigned)
                </span>
              </>
            )}
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer text-gray-700 hover:text-gray-900 font-medium">
              Subscribe to {data.events.length} events in GHL
            </summary>
            <div className="mt-3 space-y-3 text-sm text-gray-600 pl-4">
              <p className="text-xs text-gray-500">
                One-time setup. For each event below, create a Workflow with that trigger and a single Webhook action.
              </p>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Open GHL → <strong>Automation</strong> → <strong>Workflows</strong> → <strong>+ Create Workflow</strong></li>
                <li>Pick the trigger (e.g. <em>Contact Created</em>, <em>Inbound Message</em>)</li>
                <li>
                  Add an <strong>Action → Webhook</strong>:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                    <li>Method: <strong>POST</strong></li>
                    <li>URL: the Webhook URL shown above</li>
                    <li>
                      Custom Header: <code className="text-xs bg-gray-100 px-1 rounded">x-wh-signature</code> = <em>your <code>GHL_WEBHOOK_SECRET</code> value</em>
                    </li>
                  </ul>
                </li>
                <li>Save and publish the workflow. Repeat for each event below.</li>
              </ol>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {data.events.map((e) => (
                  <span key={e} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5">
                    {e}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Don&apos;t have <code>GHL_WEBHOOK_SECRET</code> set? Generate one with{' '}
                <code className="bg-gray-100 px-1 rounded">openssl rand -hex 32</code> and add it to your env on both
                Vercel and <code>.env.local</code>.
              </p>
            </div>
          </details>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            {data.configured ? (
              <>
                <span className="text-sm text-green-700 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Marked configured
                  {data.configuredAt && (
                    <span className="text-xs text-gray-400 font-normal">
                      · {new Date(data.configuredAt).toLocaleDateString()}
                    </span>
                  )}
                </span>
                <button
                  onClick={reset}
                  disabled={saving}
                  className="ml-auto text-xs text-gray-400 hover:text-red-600 transition-colors"
                >
                  Reset
                </button>
              </>
            ) : (
              <button
                onClick={markConfigured}
                disabled={saving}
                className="btn-gradient px-4 py-2 text-sm inline-flex items-center gap-2 disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Mark webhooks configured
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function BackfillCard() {
  const [status, setStatus] = useState<BackfillStatus | null>(null)
  const [running, setRunning] = useState<Record<string, boolean>>({})

  async function load() {
    const res = await fetch('/api/admin/ghl/backfill/status')
    if (res.ok) setStatus(await res.json())
  }
  useEffect(() => {
    load()
  }, [])

  async function runOne(entity: string, reset = false) {
    setRunning((r) => ({ ...r, [entity]: true }))
    try {
      while (true) {
        const url = `/api/admin/ghl/backfill/${entity}${reset ? '?reset=1' : ''}`
        const res = await fetch(url, { method: 'POST' })
        const data = await res.json()
        if (!res.ok) {
          alert(`Backfill failed: ${data.error ?? res.statusText}`)
          break
        }
        await load()
        if (data.done) break
        reset = false
        await new Promise((r) => setTimeout(r, 200))
      }
    } finally {
      setRunning((r) => ({ ...r, [entity]: false }))
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Initial Backfill</h2>
      <p className="text-sm text-gray-500 mb-4">
        Pull existing records from GoHighLevel into Crucible OS. Webhooks keep things in sync after that.
      </p>
      <ul className="divide-y divide-gray-100">
        {BACKFILL_ENTITIES.map((entity) => {
          const s = status?.entities?.[entity]
          const isRunning = !!running[entity]
          const supported = entity === 'contacts' || entity === 'conversations'
          return (
            <li key={entity} className="py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 capitalize">{entity}</p>
                <p className="text-xs text-gray-500">
                  {s
                    ? s.done
                      ? `Synced ${s.syncedCount}${s.total ? ` of ${s.total}` : ''} · done`
                      : `Synced ${s.syncedCount}${s.total ? ` of ${s.total}` : ''} · in progress`
                    : supported
                      ? 'Not yet run'
                      : 'Available in a later phase'}
                </p>
                {s?.lastError && <p className="text-xs text-red-600 mt-1">{s.lastError}</p>}
              </div>
              <button
                onClick={() => runOne(entity)}
                disabled={isRunning || !supported}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
                {s?.done ? 'Re-run' : isRunning ? 'Running…' : 'Run'}
              </button>
              {s && (
                <button
                  onClick={() => runOne(entity, true)}
                  disabled={isRunning || !supported}
                  className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-40"
                  title="Reset cursor and start over"
                >
                  Reset
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
