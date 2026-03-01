'use client'

import { useEffect, useRef, useState } from 'react'
import { PaperPlaneTiltIcon, XIcon, SparkleIcon } from '@phosphor-icons/react'
import { streamEnhance } from '@/lib/ai'

interface EnhanceInputProps {
  selectedText: string
  resumeContext: string
  bottomY: number  // container-relative Y of bottom of selected line
  onClose: () => void
  onApply: (replacement: string) => void
}

export default function EnhanceInput({
  selectedText,
  resumeContext,
  bottomY,
  onClose,
  onApply,
}: EnhanceInputProps) {
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Refs so event handlers always see current values without stale closure issues
  const instructionRef = useRef(instruction)
  instructionRef.current = instruction
  const loadingRef = useRef(loading)
  loadingRef.current = loading

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        abortRef.current?.abort()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const shake = () => {
    cardRef.current?.animate(
      [
        { transform: 'translateX(-50%)' },
        { transform: 'translateX(calc(-50% - 5px))' },
        { transform: 'translateX(calc(-50% + 5px))' },
        { transform: 'translateX(calc(-50% - 3px))' },
        { transform: 'translateX(calc(-50% + 3px))' },
        { transform: 'translateX(-50%)' },
      ],
      { duration: 280, easing: 'ease-in-out' }
    )
  }

  // Backdrop mousedown: close if empty, shake if text/loading
  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    if (loadingRef.current || instructionRef.current.trim()) {
      e.preventDefault() // keep focus in textarea, don't dismiss
      shake()
    } else {
      onClose()
    }
  }

  const handleSubmit = async () => {
    if (!instruction.trim() || loading) return

    setLoading(true)
    setError(null)

    abortRef.current = streamEnhance({
      instruction: instruction.trim(),
      selectedText,
      resumeContext,
      onChunk: () => {},
      onDone: (fullText) => {
        setLoading(false)
        const match = fullText.match(/<<<SUGGESTION>>>([\s\S]*?)<<<END>>>/)
        const replacement = match ? match[1].trim() : fullText.trim()
        onApply(replacement)
      },
      onError: (errMsg) => {
        setLoading(false)
        setError(errMsg)
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <>
      {/* Backdrop — sits behind the card, covers the viewport */}
      <div
        className="fixed inset-0 z-[49]"
        onMouseDown={handleBackdropMouseDown}
      />

      {/* Card */}
      <div
        ref={cardRef}
        className="absolute z-50 w-[340px] rounded-xl border border-border bg-surface shadow-xl shadow-black/30"
        style={{
          top: `${bottomY + 8}px`,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface-2 rounded-t-xl">
          <div className="flex items-center gap-2">
            <SparkleIcon size={14} className="text-secondary" weight="fill" />
            <span className="text-sm font-medium text-text">Enhance with AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-text hover:bg-surface rounded transition-colors"
            title="Close (Esc)"
          >
            <XIcon size={14} />
          </button>
        </div>

        {/* Selected text context */}
        <div className="px-3 py-2 border-b border-border bg-surface-2">
          <div className="text-[10px] uppercase tracking-wide text-faint mb-1">Selected text</div>
          <div className="text-xs text-muted line-clamp-3 font-mono">
            {selectedText}
          </div>
        </div>

        {/* Instruction input */}
        <div className="px-3 py-2">
          <textarea
            ref={textareaRef}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Improve this section..."
            rows={2}
            className="w-full bg-transparent text-sm text-text placeholder:text-faint outline-none resize-none"
            disabled={loading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="px-3 pb-2">
            <div className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded">
              {error}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-border bg-surface-2 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-xs text-muted hover:text-text rounded-md hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!instruction.trim() || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary text-bg rounded-md hover:bg-secondary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <PaperPlaneTiltIcon size={12} weight="fill" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
