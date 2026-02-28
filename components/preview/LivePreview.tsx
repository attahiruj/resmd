'use client'

import React, { useMemo, useRef, useEffect, useState, Suspense } from 'react'
import { parseResume } from '@/lib/parser'
import { getTemplate } from '@/lib/templates'
import EmptyState from './EmptyState'

const A4_WIDTH = 595

interface LivePreviewProps {
  rawContent: string
  templateId: string
  isPro: boolean
}

export default function LivePreview({ rawContent, templateId, isPro }: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const parsedResume = useMemo(() => parseResume(rawContent), [rawContent])
  const template = getTemplate(templateId)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const containerWidth = el.clientWidth
      setScale(Math.min(1, containerWidth / A4_WIDTH))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const isEmpty = !rawContent.trim() || !parsedResume.meta.name

  if (isEmpty || !template) {
    return (
      <div className="flex items-center justify-center h-full p-8 bg-surface-2">
        <EmptyState />
      </div>
    )
  }

  const TemplateComponent = template.component

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto overflow-x-hidden flex flex-col items-center py-8 px-4"
    >
      <div
        style={{
          width: A4_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          // Collapse the extra vertical space caused by scaling down
          marginBottom: scale < 1 ? `${A4_WIDTH * (scale - 1)}px` : undefined,
          // Resume always renders on white regardless of theme
          background: '#ffffff',
          color: '#1c1b18',
        }}
        className="shadow-lg rounded-lg"
      >
        <Suspense
          fallback={
            <div className="h-96 flex items-center justify-center text-sm" style={{ color: '#9b9891' }}>
              Loading template…
            </div>
          }
        >
          <TemplateComponent resume={parsedResume} isPro={isPro} />
        </Suspense>
      </div>
    </div>
  )
}
