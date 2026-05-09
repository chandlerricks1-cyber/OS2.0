'use client'

import { useState, useTransition } from 'react'
import { Check, Copy, ExternalLink, RefreshCw, Share2, X } from 'lucide-react'
import {
  enablePublicShare,
  disablePublicShare,
  regeneratePublicShareSlug,
} from '@/lib/actions'

type State = {
  slug: string | null
  enabled: boolean
}

export function ShareLinkButton({
  initial,
  baseUrl,
}: {
  initial: State
  baseUrl: string
}) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>(initial)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const fullUrl = state.slug ? `${baseUrl}/m/${state.slug}` : null

  function run(action: () => Promise<State>) {
    setError(null)
    startTransition(async () => {
      try {
        const next = await action()
        setState(next)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  async function copy() {
    if (!fullUrl) return
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Could not copy to clipboard')
    }
  }

  function regenerate() {
    if (!confirm('Generate a new share link? The current link will stop working immediately.')) {
      return
    }
    run(async () => {
      const r = await regeneratePublicShareSlug()
      return { slug: r.slug, enabled: r.enabled }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        {state.enabled ? 'Share link' : 'Share with team'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-xl">
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Share your Money Model</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Anyone with the link can view (read-only) your Money Model and Classroom — no login required.
                  Use it to train your team.
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {!state.slug ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Create a public link to share with your employees. You can disable or rotate it any time.
                  </p>
                  <button
                    onClick={() =>
                      run(async () => {
                        const r = await enablePublicShare()
                        return { slug: r.slug, enabled: r.enabled }
                      })
                    }
                    disabled={isPending}
                    className="btn-gradient text-sm px-4 py-2 inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isPending ? 'Creating…' : 'Create share link'}
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Public link
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        readOnly
                        value={fullUrl ?? ''}
                        className={`flex-1 text-sm px-3 py-2 rounded-lg border bg-gray-50 ${
                          state.enabled ? 'border-gray-200 text-gray-900' : 'border-gray-200 text-gray-400'
                        }`}
                        onFocus={(e) => e.currentTarget.select()}
                      />
                      <button
                        onClick={copy}
                        disabled={!state.enabled}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    {!state.enabled && (
                      <p className="text-xs text-gray-500 mt-2">
                        Sharing is currently <span className="font-semibold">disabled</span>. The link above will not load until you re-enable it.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Public sharing</span>
                      <button
                        onClick={() =>
                          state.enabled
                            ? run(async () => {
                                const r = await disablePublicShare()
                                return { slug: r.slug, enabled: r.enabled }
                              })
                            : run(async () => {
                                const r = await enablePublicShare()
                                return { slug: r.slug, enabled: r.enabled }
                              })
                        }
                        disabled={isPending}
                        role="switch"
                        aria-checked={state.enabled}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                          state.enabled ? 'bg-brand-gradient-end' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            state.enabled ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span className="text-xs text-gray-500">{state.enabled ? 'On' : 'Off'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {state.enabled && fullUrl && (
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-gradient-end px-2 py-1.5 rounded-lg"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Preview
                        </a>
                      )}
                      <button
                        onClick={regenerate}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 px-2 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
