'use client'

import React, { useMemo, useRef, useEffect, useState, Suspense } from 'react'
import { parseResume } from '@/lib/parser'
import { getTemplate } from '@/lib/templates'
import EmptyState from './EmptyState'

const A4_WIDTH = 595
const A4_HEIGHT = 842
const PAGE_GAP = 20
const PAGE_PADDING = 32

interface LivePreviewProps {
  rawContent: string
  templateId: string
  isPro: boolean
}

export default function LivePreview({ rawContent, templateId, isPro }: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [numPages, setNumPages] = useState(1)

  const parsedResume = useMemo(() => parseResume(rawContent), [rawContent])
  const template = getTemplate(templateId)

  // Scale to fill container width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setScale((el.clientWidth - PAGE_PADDING * 2) / A4_WIDTH)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Measure content height → page count
  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    const update = () => setNumPages(Math.max(1, Math.ceil(el.scrollHeight / A4_HEIGHT)))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [parsedResume, templateId])

  const isEmpty = !rawContent.trim() || !parsedResume.meta.name

  if (isEmpty || !template) {
    return (
      <div className="flex items-center justify-center h-full p-8 bg-surface-2">
        <EmptyState />
      </div>
    )
  }

  const TemplateComponent = template.component
  const totalUnscaledHeight =
    PAGE_PADDING + numPages * A4_HEIGHT + (numPages - 1) * PAGE_GAP + PAGE_PADDING

  return (
    <div ref={containerRef} className="h-full overflow-y-auto overflow-x-hidden bg-surface-2">
      {/* Hidden measurement div */}
      <div style={{ position: 'relative', overflow: 'hidden', width: 0, height: 0 }}>
        <div
          ref={measureRef}
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: A4_WIDTH,
            visibility: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <Suspense fallback={null}>
            <TemplateComponent resume={parsedResume} isPro={isPro} />
          </Suspense>
        </div>
      </div>

      {/* Spacer sets scroll height; scaled pages sit inside it */}
      <div style={{ height: totalUnscaledHeight * scale, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: PAGE_PADDING,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: A4_WIDTH,
            paddingTop: PAGE_PADDING,
            paddingBottom: PAGE_PADDING,
            display: 'flex',
            flexDirection: 'column',
            gap: PAGE_GAP,
          }}
        >
          {Array.from({ length: numPages }, (_, i) => (
            <div
              key={i}
              style={{
                width: A4_WIDTH,
                height: A4_HEIGHT,
                overflow: 'hidden',
                flexShrink: 0,
                background: '#ffffff',
                boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: -i * A4_HEIGHT, width: A4_WIDTH }}>
                <Suspense fallback={null}>
                  <TemplateComponent resume={parsedResume} isPro={isPro} />
                </Suspense>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
