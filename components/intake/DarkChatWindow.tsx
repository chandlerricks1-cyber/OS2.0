'use client'

import { useEffect, useRef, useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types/intake'
import { TypingIndicator } from './TypingIndicator'

// Strip INTAKE_COMPLETE + metric update tags from displayed text
function cleanDisplayContent(content: string): string {
  let clean = content
  // Remove INTAKE_COMPLETE block
  const idx = clean.indexOf('INTAKE_COMPLETE')
  if (idx !== -1) clean = clean.slice(0, idx).trim()
  // Remove any lingering complete metric tags
  clean = clean.replace(/\[METRIC_UPDATE:\{[^}]+\}\]\n?/g, '')
  return clean
}

function DarkMessage({ message, isStreaming }: { message: ChatMessageType; isStreaming?: boolean }) {
  const isUser = message.role === 'user'
  const displayContent = cleanDisplayContent(message.content)

  if (!isUser && !displayContent && isStreaming) {
    return (
      <div className="flex justify-start">
        <div className="bg-[#1e1e22] border border-white/[0.08] rounded-2xl rounded-tl-sm">
          <TypingIndicator />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? 'bg-[#2a1506] border border-brand-orange/30 text-white rounded-tr-sm'
            : 'bg-[#1e1e22] border border-white/[0.08] text-white/90 rounded-tl-sm'
          }
        `}
      >
        {displayContent}
        {isStreaming && !isUser && (
          <span className="inline-block w-0.5 h-4 bg-white/30 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  )
}

function DarkChatInput({
  onSend,
  disabled,
  placeholder = 'Type your answer…',
}: {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }
  }, [value])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  return (
    <div className="px-4 pb-4 pt-2">
      {/* Bolt-style input container */}
      <div className="relative">
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
        <div className="relative rounded-2xl bg-[#1e1e22] ring-1 ring-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_2px_16px_rgba(0,0,0,0.4)]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none bg-transparent text-sm text-white placeholder-white/25 px-4 pt-4 pb-3 focus:outline-none min-h-[52px] max-h-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex items-center justify-end px-3 pb-3">
            <button
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-brand-orange hover:bg-brand-orange-dark text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_16px_rgba(232,101,48,0.25)]"
            >
              <SendHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] text-white/20 mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}

interface DarkChatWindowProps {
  messages: ChatMessageType[]
  isStreaming: boolean
  isComplete: boolean
  onSend: (message: string) => void
}

export function DarkChatWindow({ messages, isStreaming, isComplete, onSend }: DarkChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const lastMessage = messages[messages.length - 1]
  const lastIsStreaming = isStreaming && lastMessage?.role === 'assistant'

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Subtle warm glow at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(232,101,48,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 relative">
        {messages.map((message, i) => (
          <DarkMessage
            key={message.id}
            message={message}
            isStreaming={i === messages.length - 1 && lastIsStreaming}
          />
        ))}

        {isComplete && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-4 py-2 text-sm font-medium">
              <span>✓</span> Analysis complete — building your dashboard
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <DarkChatInput
        onSend={onSend}
        disabled={isStreaming || isComplete}
        placeholder={isComplete ? 'Analysis complete' : 'Type your answer…'}
      />
    </div>
  )
}
