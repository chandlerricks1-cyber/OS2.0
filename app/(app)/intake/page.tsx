'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sun, Moon, Sparkles, RotateCcw, BarChart3, X } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useSystemTheme } from '@/hooks/useSystemTheme'
import { DarkChatWindow } from '@/components/intake/DarkChatWindow'
import { MetricProgressPanel } from '@/components/intake/MetricProgressPanel'

export default function IntakePage() {
  const router = useRouter()
  const { isDark, toggle } = useSystemTheme()
  const [panelOpen, setPanelOpen] = useState(false)

  const {
    messages,
    isStreaming,
    isComplete,
    error,
    partialMetrics,
    sendMessage,
    startIntake,
    retryLastMessage,
    resetChat,
  } = useChat({
    sessionId: null,
    storageKey: 'crucible-intake-chat',
    onComplete: () => {
      setTimeout(() => router.push('/dashboard'), 2000)
    },
  })

  function handleReset() {
    if (!confirm('Start the intake over? Your previous answers will be cleared.')) return
    resetChat()
    setTimeout(() => startIntake(), 0)
  }

  useEffect(() => {
    startIntake()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pageBg = isDark ? 'bg-[#0f0f0f]' : 'bg-brand-cream'
  const panelBg = isDark ? 'bg-[#0a0a0a]' : 'bg-white'
  const headerBorder = isDark ? 'border-white/[0.06]' : 'border-gray-200'
  const headingText = isDark ? 'text-white/80' : 'text-gray-900'
  const subText = isDark ? 'text-white/30' : 'text-gray-500'
  const errorCls = isDark
    ? 'bg-red-500/10 border-red-500/20 text-red-400'
    : 'bg-red-50 border-red-200 text-red-700'
  const retryCls = isDark
    ? 'text-red-400 hover:text-red-300'
    : 'text-red-700 hover:text-red-800'
  const toggleCls = isDark
    ? 'bg-white/10 text-gray-400 hover:text-white'
    : 'bg-gray-100 text-gray-500 hover:text-gray-900'

  return (
    <div
      className={`-m-4 sm:-m-6 flex overflow-hidden transition-colors duration-300 ${pageBg}`}
      style={{ height: 'calc(100svh - 49px)' }}
    >
      {/* Left: Chat */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className={`shrink-0 px-6 py-4 border-b flex items-center justify-between gap-4 ${headerBorder}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className={`text-sm font-bold ${headingText}`}>Business Analysis</h1>
              <p className={`text-xs mt-0.5 ${subText}`}>
                We&apos;ll cover your business overview, key metrics, and what&apos;s holding back your growth.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setPanelOpen(true)}
              className={`lg:hidden h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-colors ${toggleCls}`}
              aria-label="Show business profile"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Progress
            </button>
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                disabled={isStreaming}
                className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${toggleCls}`}
                aria-label="Start over"
                title="Start over"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start over
              </button>
            )}
            <button
              onClick={toggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${toggleCls}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className={`shrink-0 mx-6 mt-3 border rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-4 ${errorCls}`}>
            <span>{error}</span>
            <button
              onClick={retryLastMessage}
              disabled={isStreaming}
              className={`shrink-0 underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium ${retryCls}`}
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
            isDark={isDark}
          />
        </div>
      </div>

      {/* Right: Metric Progress Panel (desktop) */}
      <div className={`hidden lg:flex w-72 xl:w-80 shrink-0 border-l overflow-hidden flex-col transition-colors duration-300 ${headerBorder} ${panelBg}`}>
        <MetricProgressPanel partialMetrics={partialMetrics} isDark={isDark} />
      </div>

      {/* Mobile drawer */}
      <div
        onClick={() => setPanelOpen(false)}
        className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${
          panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />
      <div
        className={`lg:hidden fixed inset-y-0 right-0 w-[85%] max-w-sm z-50 flex flex-col transition-transform duration-300 ${panelBg} ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setPanelOpen(false)}
          aria-label="Close"
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-md flex items-center justify-center ${toggleCls}`}
        >
          <X className="w-4 h-4" />
        </button>
        <MetricProgressPanel partialMetrics={partialMetrics} isDark={isDark} />
      </div>
    </div>
  )
}
