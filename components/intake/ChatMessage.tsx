import type { ChatMessage as ChatMessageType } from '@/types/intake'
import { TypingIndicator } from './TypingIndicator'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

function cleanContent(content: string): string {
  // Remove INTAKE_COMPLETE sentinel and JSON block from displayed text
  const idx = content.indexOf('INTAKE_COMPLETE')
  if (idx !== -1) {
    return content.slice(0, idx).trim()
  }
  return content
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const displayContent = cleanContent(message.content)

  if (!isUser && !displayContent && isStreaming) {
    return (
      <div className="flex justify-start">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm">
          <TypingIndicator />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gray-900 text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
        }`}
      >
        {displayContent}
        {isStreaming && !isUser && (
          <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  )
}
