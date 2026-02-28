'use client'

import { useEffect, useRef, useState } from 'react'
import LivePreview from './LivePreview'
import { getAllTemplates } from '@/lib/templates'

interface PreviewPaneProps {
  rawContent: string
  templateId: string
  onTemplateChange: (id: string) => void
  isPro?: boolean
}

export default function PreviewPane({
  rawContent,
  templateId,
  onTemplateChange,
  isPro = false,
}: PreviewPaneProps) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const templates = getAllTemplates()
  const current = templates.find((t) => t.id === templateId)

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-surface-2">
      {/* Resume preview scroll area */}
      <div className="flex-1 overflow-hidden">
        <LivePreview rawContent={rawContent} templateId={templateId} isPro={isPro} />
      </div>

      {/* Template picker trigger — floating pill at bottom center */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">

        {/* Picker card — appears above the trigger */}
        {showPicker && (
          <div
            ref={pickerRef}
            className="bg-surface border border-border rounded-xl shadow-xl p-2.5 flex gap-2 overflow-x-auto max-w-[480px]"
            style={{ scrollbarWidth: 'none' }}
          >
            {templates.map((tpl) => {
              const isActive = tpl.id === templateId
              const isLocked = tpl.isPro && !isPro
              return (
                <button
                  key={tpl.id}
                  disabled={isLocked}
                  onClick={() => {
                    if (!isLocked) {
                      onTemplateChange(tpl.id)
                      setShowPicker(false)
                    }
                  }}
                  title={isLocked ? 'Upgrade to Pro' : tpl.name}
                  className={`flex-none flex flex-col items-start px-3 py-2 rounded-lg border transition-colors duration-150 min-w-[96px] ${
                    isActive
                      ? 'border-accent bg-accent-muted'
                      : isLocked
                        ? 'border-border opacity-40 cursor-not-allowed'
                        : 'border-border hover:bg-surface-2 cursor-pointer'
                  }`}
                >
                  <span className={`text-sm font-medium ${isActive ? 'text-accent' : 'text-text'}`}>
                    {tpl.name}
                  </span>
                  {tpl.isPro && (
                    <span className="mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">
                      Pro
                    </span>
                  )}
                  {!tpl.isPro && (
                    <span className="mt-0.5 text-[10px] text-faint">{tpl.category}</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Trigger pill */}
        <button
          ref={triggerRef}
          onClick={() => setShowPicker((v) => !v)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border shadow-lg text-sm text-text hover:bg-surface-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <TemplatesIcon />
          <span>{current?.name ?? templateId}</span>
          <ChevronIcon open={showPicker} />
        </button>
      </div>
    </div>
  )
}

function TemplatesIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
