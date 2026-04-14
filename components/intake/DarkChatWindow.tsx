'use client'

import { useEffect, useRef, useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types/intake'
import { TypingIndicator } from './TypingIndicator'

function cleanDisplayContent(content: string): string {
  let clean = content
  const idx = clean.indexOf('INTAKE_COMPLETE')
  if (idx !== -1) clean = clean.slice(0, idx).trim()
  clean = clean.replace(/\[METRIC_UPDATE:\{[^}]+\}\]\n?/g, '')
  return clean
}

function Message({
  message,
  isStreaming,
  isDark,
}: {
  message: ChatMessageType
  isStreaming?: boolean
  isDark: boolean
}) {
  const isUser = message.role === 'user'
  const displayContent = cleanDisplayContent(message.content)

  const assistantBubble = isDark
    ? 'bg-[#1e1e22] border border-white/[0.08] text-white/90'
    : 'bg-white border border-gray-200 text-gray-800 shadow-card-soft'

  const userBubble = 'bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end text-white shadow-[0_4px_14px_rgba(255,136,0,0.25)]'

  if (!isUser && !displayContent && isStreaming) {
    return (
      <div className="flex justify-start">
        <div className={`rounded-2xl rounded-tl-sm ${assistantBubble}`}>
          <TypingIndicator />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? `${userBubble} rounded-tr-sm` : `${assistantBubble} rounded-tl-sm`
        }`}
      >
        {displayContent}
        {isStreaming && !isUser && (
          <span className={`inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle ${isDark ? 'bg-white/30' : 'bg-gray-400'}`} />
        )}
      </div>
    </div>
  )
}

function ChatInput({
  onSend,
  disabled,
  placeholder = 'Type your answer…',
  isDark,
}: {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  isDark: boolean
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
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const containerCls = isDark
    ? 'bg-[#1e1e22] ring-1 ring-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_2px_16px_rgba(0,0,0,0.4)]'
    : 'bg-white ring-1 ring-gray-200 shadow-card-soft'
  const textareaCls = isDark
    ? 'text-white placeholder-white/25'
    : 'text-gray-900 placeholder-gray-400'
  const hintCls = isDark ? 'text-white/20' : 'text-gray-400'

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="relative">
        <div className={`relative rounded-2xl ${containerCls}`}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={`w-full resize-none bg-transparent text-sm px-4 pt-4 pb-3 focus:outline-none min-h-[52px] max-h-[160px] disabled:opacity-50 disabled:cursor-not-allowed ${textareaCls}`}
          />
          <div className="flex items-center justify-end px-3 pb-3">
            <button
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end hover:shadow-[0_4px_14px_rgba(255,136,0,0.35)] text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <SendHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <p className={`text-center text-[10px] mt-2 ${hintCls}`}>
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
  isDark?: boolean
}

export function DarkChatWindow({ messages, isStreaming, isComplete, onSend, isDark = true }: DarkChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const lastMessage = messages[messages.length - 1]
  const lastIsStreaming = isStreaming && lastMessage?.role === 'assistant'

  const glowOpacity = isDark ? 0.06 : 0.1

  const completeBadge = isDark
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200'

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, rgba(255,136,0,${glowOpacity}) 0%, transparent 70%)`,
        }}
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 relative">
        {messages.map((message, i) => (
          <Message
            key={message.id}
            message={message}
            isStreaming={i === messages.length - 1 && lastIsStreaming}
            isDark={isDark}
          />
        ))}

        {isComplete && (
          <div className="text-center py-4">
            <div className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-medium ${completeBadge}`}>
              <span>✓</span> Analysis complete — building your dashboard
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={onSend}
        disabled={isStreaming || isComplete}
        placeholder={isComplete ? 'Analysis complete' : 'Type your answer…'}
        isDark={isDark}
      />
    </div>
  )
}
