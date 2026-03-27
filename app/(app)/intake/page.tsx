'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@/hooks/useChat'
import { DarkChatWindow } from '@/components/intake/DarkChatWindow'
import { MetricProgressPanel } from '@/components/intake/MetricProgressPanel'

export default function IntakePage() {
  const router = useRouter()

  const {
    messages,
    isStreaming,
    isComplete,
    error,
    partialMetrics,
    sendMessage,
    startIntake,
    retryLastMessage,
  } = useChat({
    sessionId: null,
    onComplete: () => {
      setTimeout(() => router.push('/dashboard'), 2000)
    },
  })

  useEffect(() => {
    startIntake()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    // Escape the parent layout's p-6 padding and fill available viewport height
    <div
      className="-m-6 flex bg-[#0f0f0f] overflow-hidden"
      style={{ height: 'calc(100svh - 49px)' }}
    >
      {/* Left: Chat */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-white/[0.06]">
          <h1 className="text-sm font-semibold text-white/70">Business Analysis</h1>
          <p className="text-xs text-white/30 mt-0.5">
            We&apos;ll cover your business overview, key metrics, and what&apos;s holding back your growth.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="shrink-0 mx-6 mt-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              onClick={retryLastMessage}
              disabled={isStreaming}
              className="shrink-0 text-red-400 underline underline-offset-2 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Chat window */}
        <div className="flex-1 min-h-0">
          <DarkChatWindow
            messages={messages}
            isStreaming={isStreaming}
            isComplete={isComplete}
            onSend={sendMessage}
          />
        </div>
      </div>

      {/* Right: Metric Progress Panel */}
      <div className="w-72 xl:w-80 shrink-0 border-l border-white/[0.06] bg-[#0a0a0a] overflow-hidden flex flex-col">
        <MetricProgressPanel partialMetrics={partialMetrics} />
      </div>
    </div>
  )
}
