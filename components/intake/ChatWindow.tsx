'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageType } from '@/types/intake'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

interface ChatWindowProps {
  messages: ChatMessageType[]
  isStreaming: boolean
  isComplete: boolean
  onSend: (message: string) => void
}

export function ChatWindow({ messages, isStreaming, isComplete, onSend }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const lastMessage = messages[messages.length - 1]
  const lastIsStreaming = isStreaming && lastMessage?.role === 'assistant'

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message, i) => (
          <ChatMessage
            key={message.id}
            message={message}
            isStreaming={i === messages.length - 1 && lastIsStreaming}
          />
        ))}

        {isComplete && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-full px-4 py-2 text-sm font-medium">
              <span>✓</span> Analysis complete — redirecting to your results
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={onSend}
        disabled={isStreaming || isComplete}
        placeholder={isComplete ? 'Analysis complete' : 'Type your answer…'}
      />
    </div>
  )
}
