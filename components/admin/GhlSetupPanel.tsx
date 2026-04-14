'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, RefreshCw } from 'lucide-react'

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
                      New leads from <code>/podcast</code> will land in the "New Lead" stage automatically.
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
                  No "Podcast" pipeline found in your GHL account. Click below to create it with
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
    </div>
  )
}
