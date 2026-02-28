'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Toolbar from '@/components/editor/Toolbar'
import PreviewPane from '@/components/preview/PreviewPane'
import AIChat from '@/components/editor/AIChat'
import SnapshotModal from '@/components/editor/SnapshotModal'
import type { ResumeVariant } from '@/types/resume'

// CodeMirror is browser-only
const Editor = dynamic(() => import('@/components/editor/Editor'), { ssr: false })

const MIN_PANE_PX = 300
const DEFAULT_SPLIT = 50
const AUTOSAVE_DELAY = 2000

type MobileTab = 'write' | 'preview'

interface EditorClientProps {
  variant: ResumeVariant
  isPro: boolean
}

export default function EditorClient({ variant, isPro }: EditorClientProps) {
  const [rawContent, setRawContent] = useState(variant.rawContent)
  const [templateId, setTemplateId] = useState(variant.templateId)
  const [variantTitle, setVariantTitle] = useState(variant.title)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [showSnapshotModal, setShowSnapshotModal] = useState(false)
  const [splitPct, setSplitPct] = useState(DEFAULT_SPLIT)
  const [mobileTab, setMobileTab] = useState<MobileTab>('write')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Refs for 60fps split drag
  const bodyRef = useRef<HTMLDivElement>(null)
  const leftPaneRef = useRef<HTMLDivElement>(null)
  const rightPaneRef = useRef<HTMLDivElement>(null)
  const splitPctRef = useRef(DEFAULT_SPLIT)

  // Refs to capture latest values in debounced autosave
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rawContentRef = useRef(rawContent)
  const templateIdRef = useRef(templateId)
  const variantTitleRef = useRef(variantTitle)
  rawContentRef.current = rawContent
  templateIdRef.current = templateId
  variantTitleRef.current = variantTitle

  useEffect(() => {
    const savedSplit = localStorage.getItem('resmd_split')
    if (savedSplit) {
      const n = Number(savedSplit)
      if (!isNaN(n) && n >= 20 && n <= 80) {
        setSplitPct(n)
        splitPctRef.current = n
      }
    }
    setIsMounted(true)
  }, [])

  const autosave = useCallback(async () => {
    setIsSaving(true)
    try {
      await fetch(`/api/variants/${variant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: rawContentRef.current,
          templateId: templateIdRef.current,
        }),
      })
      setLastSaved(new Date())
    } catch {
      // Silently fail autosave
    } finally {
      setIsSaving(false)
    }
  }, [variant.id])

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(autosave, AUTOSAVE_DELAY)
  }, [autosave])

  const handleContentChange = useCallback((value: string) => {
    setRawContent(value)
    scheduleAutosave()
  }, [scheduleAutosave])

  const handleTemplateChange = useCallback((id: string) => {
    setTemplateId(id)
    localStorage.setItem('resmd_template', id)
    scheduleAutosave()
  }, [scheduleAutosave])

  const handleTitleChange = useCallback((title: string) => {
    setVariantTitle(title)
    if (titleSaveTimerRef.current) clearTimeout(titleSaveTimerRef.current)
    titleSaveTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/variants/${variant.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawContent: rawContentRef.current,
            templateId: templateIdRef.current,
            title,
          }),
        })
        setLastSaved(new Date())
      } catch {
        // Silently fail
      }
    }, 800)
  }, [variant.id])

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startPct = splitPctRef.current

    const onMouseMove = (ev: MouseEvent) => {
      const totalWidth = bodyRef.current?.offsetWidth ?? window.innerWidth
      const minPct = (MIN_PANE_PX / totalWidth) * 100
      const maxPct = 100 - minPct
      const delta = ((ev.clientX - startX) / totalWidth) * 100
      const next = Math.max(minPct, Math.min(maxPct, startPct + delta))
      splitPctRef.current = next
      if (leftPaneRef.current) leftPaneRef.current.style.width = `${next}%`
      if (rightPaneRef.current) rightPaneRef.current.style.width = `${100 - next}%`
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      const final = splitPctRef.current
      setSplitPct(final)
      localStorage.setItem('resmd_split', String(final))
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg">
      <Toolbar
        lastSaved={lastSaved}
        showAIPanel={showAIPanel}
        onToggleAI={() => setShowAIPanel((v) => !v)}
        variantTitle={variantTitle}
        onTitleChange={handleTitleChange}
        variantId={variant.id}
        isPro={isPro}
      />

      {/* Mobile tab bar (<md) */}
      <div className="md:hidden flex h-10 border-b border-border bg-surface flex-shrink-0 px-2 gap-1 items-center">
        <button
          onClick={() => setMobileTab('write')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-colors duration-150 ${
            mobileTab === 'write'
              ? 'bg-accent-muted text-accent'
              : 'text-muted hover:text-text'
          }`}
        >
          Write
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-colors duration-150 ${
            mobileTab === 'preview'
              ? 'bg-accent-muted text-accent'
              : 'text-muted hover:text-text'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Mobile single-pane body */}
      <div className="md:hidden flex-1 overflow-hidden min-h-0">
        {mobileTab === 'write' ? (
          <div className="h-full flex flex-col bg-editor-bg">
            <div className="flex-1 min-h-0 overflow-hidden">
              {isMounted && <Editor value={rawContent} onChange={handleContentChange} />}
            </div>
            <AIChat resumeContent={rawContent} />
          </div>
        ) : (
          <PreviewPane
            rawContent={rawContent}
            templateId={templateId}
            onTemplateChange={handleTemplateChange}
            isPro={isPro}
          />
        )}
      </div>

      {/* Desktop split-pane body (≥md) */}
      <div className="hidden md:flex flex-1 min-h-0 p-8">
        <div ref={bodyRef} className="flex flex-1 overflow-hidden rounded-xl border border-border">
          {/* Editor pane */}
          <div
            ref={leftPaneRef}
            className="flex flex-col overflow-hidden flex-shrink-0 bg-editor-bg"
            style={{ width: `${splitPct}%` }}
          >
            <div className="flex-1 min-h-0 overflow-hidden">
              {isMounted && <Editor value={rawContent} onChange={handleContentChange} />}
            </div>
            <AIChat resumeContent={rawContent} />
          </div>

          {/* Drag divider */}
          <div
            className="w-1 flex-shrink-0 bg-border hover:bg-accent transition-colors duration-150 select-none"
            style={{ cursor: 'col-resize' }}
            onMouseDown={handleDividerMouseDown}
          />

          {/* Preview pane */}
          <div
            ref={rightPaneRef}
            className="flex-1 overflow-hidden"
            style={{ width: `${100 - splitPct}%` }}
          >
            <PreviewPane
              rawContent={rawContent}
              templateId={templateId}
              onTemplateChange={handleTemplateChange}
              isPro={isPro}
            />
          </div>
        </div>
      </div>

      {/* AI panel placeholder — wired up in Stage 8 */}
      {showAIPanel && (
        <div
          className="fixed top-[61px] right-0 bottom-0 w-[380px] bg-surface border-l border-border z-40 flex items-center justify-center"
          style={{ transform: 'translateX(0)', transition: 'transform 200ms ease-out' }}
        >
          <div className="text-center p-8">
            <div className="text-4xl mb-3">✦</div>
            <p className="text-sm text-muted">AI assistant coming in Stage 8</p>
          </div>
        </div>
      )}

      {/* Snapshot modal */}
      {showSnapshotModal && (
        <SnapshotModal
          variantId={variant.id}
          rawContent={rawContent}
          templateId={templateId}
          onClose={() => setShowSnapshotModal(false)}
          onSaved={() => {
            setLastSaved(new Date())
            setShowSnapshotModal(false)
          }}
        />
      )}
    </div>
  )
}
