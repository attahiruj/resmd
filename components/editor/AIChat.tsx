'use client'

import { useEffect, useRef, useState } from 'react'
import { PaperPlaneTiltIcon } from '@phosphor-icons/react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatProps {
  resumeContent: string
}

export default function AIChat({ resumeContent }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const historyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll message history to bottom whenever messages change
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          resumeContent,
          // Only send role/content pairs (omit any local state)
          history: messages.map(({ role, content }) => ({ role, content })),
        }),
      })

      const data = await res.json()
      if (data.reply) {
        setMessages([...next, { role: 'assistant', content: data.reply }])
      } else {
        setMessages([
          ...next,
          { role: 'assistant', content: 'Something went wrong. Please try again.' },
        ])
      }
    } catch {
      setMessages([
        ...next,
        { role: 'assistant', content: 'Failed to reach the AI. Check your connection.' },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col border-t border-border bg-editor-bg flex-shrink-0">
      {/* Message history — only rendered when there are messages */}
      {messages.length > 0 && (
        <div
          ref={historyRef}
          className="overflow-y-auto px-4 py-3 flex flex-col gap-2"
          style={{ maxHeight: '220px' }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col gap-0.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] uppercase tracking-wide text-faint select-none">
                {msg.role === 'user' ? 'You' : 'AI'}
              </span>
              <div
                className={`text-sm rounded-xl px-3 py-1.5 max-w-[90%] whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent text-accent-text'
                    : 'bg-surface text-text border border-border'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex flex-col gap-0.5 items-start">
              <span className="text-[10px] uppercase tracking-wide text-faint select-none">AI</span>
              <div className="text-sm rounded-xl px-3 py-1.5 bg-surface border border-border text-muted">
                <ThinkingDots />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-accent select-none text-sm flex-shrink-0" aria-hidden>
          ✦
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI to improve your resume…"
          disabled={loading}
          className="flex-1 bg-transparent text-sm text-text placeholder:text-faint outline-none disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="flex-shrink-0 p-1.5 rounded-lg text-accent hover:bg-accent-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Send (Enter)"
        >
          <PaperPlaneTiltIcon size={16} weight="fill" />
        </button>
      </div>
    </div>
  )
}

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 items-center h-4">
      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  )
}
