'use client'

import { useState, useCallback, useRef } from 'react'
import type { ChatMessage, ExtractedMetrics } from '@/types/intake'

const SENTINEL_COMPLETE = '[CRUCIBLE_COMPLETE]'
const SENTINEL_ERROR_PREFIX = '[CRUCIBLE_ERROR:'

/**
 * Returns the start index of any suffix of `text` that is a prefix of `sentinel`,
 * or -1 if none. Used to hide partial sentinels from the UI during streaming.
 */
function findPartialSentinelStart(text: string, sentinel: string): number {
  const maxCheck = Math.min(sentinel.length - 1, text.length)
  for (let len = maxCheck; len >= 1; len--) {
    if (sentinel.startsWith(text.slice(text.length - len))) {
      return text.length - len
    }
  }
  return -1
}

/** Parse all [METRIC_UPDATE:{...}] tags from accumulated text */
function extractMetricUpdates(text: string): Partial<ExtractedMetrics> {
  const updates: Partial<ExtractedMetrics> = {}
  const tagPattern = /\[METRIC_UPDATE:\{([^}]+)\}\]/g
  let match
  while ((match = tagPattern.exec(text)) !== null) {
    try {
      const obj = JSON.parse(`{${match[1]}}`) as Partial<ExtractedMetrics>
      Object.assign(updates, obj)
    } catch {
      // Skip malformed tags
    }
  }
  return updates
}

/** Strip complete and partial [METRIC_UPDATE:{...}] tags from display text */
function stripMetricTags(text: string): string {
  // Strip complete tags (and any trailing newline after them)
  let clean = text.replace(/\[METRIC_UPDATE:\{[^}]+\}\]\n?/g, '')
  // Strip any partial tag at the tail
  const partialStart = clean.lastIndexOf('[METRIC_UPDATE:')
  if (partialStart !== -1 && !clean.slice(partialStart).includes(']')) {
    clean = clean.slice(0, partialStart)
  }
  return clean
}

/** Parse the INTAKE_COMPLETE JSON block from the full streamed text */
function parseIntakeCompletionLocal(text: string): Partial<ExtractedMetrics> | null {
  const marker = 'INTAKE_COMPLETE'
  const idx = text.indexOf(marker)
  if (idx === -1) return null
  const after = text.slice(idx + marker.length)
  const jsonMatch = after.match(/```json\s*([\s\S]*?)```/)
  if (!jsonMatch) return null
  try {
    return JSON.parse(jsonMatch[1]) as Partial<ExtractedMetrics>
  } catch {
    return null
  }
}

interface UseChatOptions {
  sessionId: string | null
  onComplete?: () => void
}

export function useChat({ sessionId: initialSessionId, onComplete }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [partialMetrics, setPartialMetrics] = useState<Partial<ExtractedMetrics>>({})
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (isStreaming || isComplete) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsStreaming(true)
    setError(null)

    const assistantId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '' },
    ])

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          sessionId: currentSessionId,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(body.error || `Request failed: ${res.status}`)
      }

      const sessionIdFromHeader = res.headers.get('X-Session-Id')
      if (sessionIdFromHeader && !currentSessionId) {
        setCurrentSessionId(sessionIdFromHeader)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        // Check for completion sentinel
        if (fullText.includes(SENTINEL_COMPLETE)) {
          const sentinelIdx = fullText.indexOf(SENTINEL_COMPLETE)
          const rawDisplay = fullText.slice(0, sentinelIdx).trimEnd()
          const displayText = stripMetricTags(rawDisplay)
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: displayText } : m)
          )
          // Merge any inline metric tags + final INTAKE_COMPLETE JSON
          const tagMetrics = extractMetricUpdates(fullText)
          const completionMetrics = parseIntakeCompletionLocal(fullText)
          setPartialMetrics((prev) => ({ ...prev, ...tagMetrics, ...(completionMetrics ?? {}) }))
          setIsComplete(true)
          onComplete?.()
          break
        }

        // Check for error sentinel
        const errorIdx = fullText.indexOf(SENTINEL_ERROR_PREFIX)
        if (errorIdx !== -1) {
          const closingBracket = fullText.lastIndexOf(']')
          if (closingBracket > errorIdx + SENTINEL_ERROR_PREFIX.length) {
            const errorMsg = fullText.slice(errorIdx + SENTINEL_ERROR_PREFIX.length, closingBracket).trim()
            const displayText = stripMetricTags(fullText.slice(0, errorIdx).trimEnd())
            setMessages((prev) =>
              prev.map((m) => m.id === assistantId ? { ...m, content: displayText || '' } : m)
            )
            throw new Error(errorMsg || 'AI service error. Please try again.')
          }
        }

        // Parse any confirmed metric tags so far
        const tagMetrics = extractMetricUpdates(fullText)
        if (Object.keys(tagMetrics).length > 0) {
          setPartialMetrics((prev) => ({ ...prev, ...tagMetrics }))
        }

        // Normal streaming update — strip metric tags and partial sentinel tail
        let displayText = stripMetricTags(fullText)
        const partialStart = findPartialSentinelStart(displayText, SENTINEL_COMPLETE)
        if (partialStart !== -1) {
          displayText = displayText.slice(0, partialStart)
        }

        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: displayText } : m)
        )
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
    } finally {
      setIsStreaming(false)
    }
  }, [messages, isStreaming, isComplete, currentSessionId, onComplete])

  const startIntake = useCallback(async () => {
    if (isStreaming || messages.length > 0) return
    setIsStreaming(true)

    const assistantId = crypto.randomUUID()
    setMessages([{ id: assistantId, role: 'assistant', content: '' }])

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], sessionId: currentSessionId }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(body.error || `Request failed: ${res.status}`)
      }

      const sessionIdFromHeader = res.headers.get('X-Session-Id')
      if (sessionIdFromHeader) setCurrentSessionId(sessionIdFromHeader)

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        const errorIdx = fullText.indexOf(SENTINEL_ERROR_PREFIX)
        if (errorIdx !== -1) {
          const closingBracket = fullText.lastIndexOf(']')
          if (closingBracket > errorIdx + SENTINEL_ERROR_PREFIX.length) {
            const errorMsg = fullText.slice(errorIdx + SENTINEL_ERROR_PREFIX.length, closingBracket).trim()
            throw new Error(errorMsg || 'Failed to start intake. Please refresh.')
          }
          setMessages([{ id: assistantId, role: 'assistant', content: fullText.slice(0, errorIdx).trimEnd() }])
        } else {
          setMessages([{ id: assistantId, role: 'assistant', content: fullText }])
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to start intake. Please refresh.')
      setMessages([])
    } finally {
      setIsStreaming(false)
    }
  }, [isStreaming, messages.length, currentSessionId])

  const retryLastMessage = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser || isStreaming) return
    setError(null)
    setMessages((prev) => prev.filter((m) => m.id !== lastUser.id))
    sendMessage(lastUser.content)
  }, [messages, isStreaming, sendMessage])

  return {
    messages,
    isStreaming,
    isComplete,
    error,
    sessionId: currentSessionId,
    partialMetrics,
    sendMessage,
    startIntake,
    retryLastMessage,
  }
}
