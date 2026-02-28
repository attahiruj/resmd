'use client'

import React, { useMemo, useRef, useEffect, useState, Suspense } from 'react'
import { parseResume } from '@/lib/parser'
import { getTemplate } from '@/lib/templates'
import { DEFAULT_SETTINGS } from '@/types/resume'
import type { ParsedResume, ResumeSection } from '@/types/resume'
import EmptyState from './EmptyState'

const A4_WIDTH = 595
const A4_HEIGHT = 842
const PAGE_GAP = 20
const PAGE_PADDING = 32

interface LivePreviewProps {
  rawContent: string
  templateId: string
  isPro: boolean
  onTextDoubleClick?: (word: string, context: string) => void
}

interface PageSlice {
  showHeader: boolean
  sections: ResumeSection[]
}

/**
 * Assigns sections to pages using measured heights.
 * Page 0 includes the header section (if any) and as many body sections as fit.
 * Subsequent pages contain only body sections.
 */
function buildPageSlices(
  allSections: ResumeSection[],
  headerSection: ResumeSection | null,
  headerHeight: number,
  sectionHeights: Map<string, number>,
  usableHeight: number,
): PageSlice[] {
  const bodySections = allSections.filter(s => s !== headerSection)

  const pages: PageSlice[] = []
  let currentBody: ResumeSection[] = []
  let isFirst = true
  let used = headerHeight // first page pays the header cost upfront

  for (const section of bodySections) {
    const h = sectionHeights.get(section.id) ?? 0
    // Flush current page if section doesn't fit (always keep at least one section per page)
    if (used + h > usableHeight && currentBody.length > 0) {
      pages.push({
        showHeader: isFirst,
        sections: isFirst && headerSection
          ? [headerSection, ...currentBody]
          : currentBody,
      })
      isFirst = false
      currentBody = []
      used = 0
    }
    currentBody.push(section)
    used += h
  }

  // Last (or only) page
  pages.push({
    showHeader: isFirst,
    sections: isFirst && headerSection
      ? [headerSection, ...currentBody]
      : currentBody,
  })

  return pages
}

export default function LivePreview({ rawContent, templateId, isPro, onTextDoubleClick }: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pages, setPages] = useState<PageSlice[]>([])

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

  // Measure rendered sections → assign to pages
  useEffect(() => {
    const el = measureRef.current
    if (!el) return

    const update = () => {
      const marginV = parsedResume.settings?.marginV ?? DEFAULT_SETTINGS.marginV
      const usableHeight = A4_HEIGHT - marginV * 2

      // Header element height (includes its marginBottom)
      const headerEl = el.querySelector('[data-header]') as HTMLElement | null
      const headerHeight = headerEl?.offsetHeight ?? 0

      // Body sections: elements marked with data-section
      const sectionEls = Array.from(el.querySelectorAll('[data-section]')) as HTMLElement[]
      const sectionHeights = new Map(
        sectionEls.map(node => [node.dataset.section!, node.offsetHeight])
      )
      const bodySectionIds = new Set(sectionHeights.keys())

      // Identify header section as the one not measured as a body section
      const headerSection =
        parsedResume.sections.find(s => !bodySectionIds.has(s.id)) ?? null

      const slices = buildPageSlices(
        parsedResume.sections,
        headerSection,
        headerHeight,
        sectionHeights,
        usableHeight,
      )
      setPages(slices)
    }

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
  const numPages = Math.max(pages.length, 1)
  const totalUnscaledHeight =
    PAGE_PADDING + numPages * A4_HEIGHT + (numPages - 1) * PAGE_GAP + PAGE_PADDING

  function handleDblClick(e: React.MouseEvent) {
    if (!onTextDoubleClick) return
    requestAnimationFrame(() => {
      const sel = window.getSelection()
      const word = sel?.toString().trim()
      if (!word || !sel) return

      let el: Element | null =
        sel.anchorNode?.nodeType === Node.ELEMENT_NODE
          ? (sel.anchorNode as Element)
          : sel.anchorNode?.parentElement ?? null
      let context = ''
      while (el && el !== e.currentTarget) {
        const display = window.getComputedStyle(el).display
        if (display !== 'inline' && display !== 'inline-block' && display !== 'inline-flex') {
          context = el.textContent?.trim().replace(/^[–\-]\s*/, '') ?? ''
          break
        }
        el = el.parentElement
      }

      onTextDoubleClick(word, context)
    })
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto overflow-x-hidden bg-surface-2" onDoubleClick={handleDblClick}>
      {/* Hidden measurement div — renders the full template to measure section heights */}
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
            <TemplateComponent resume={parsedResume} isPro={isPro} showHeader />
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
          {pages.length === 0
            ? (
              // Loading state while measurement runs
              <div style={{ width: A4_WIDTH, height: A4_HEIGHT, background: '#ffffff', boxShadow: '0 1px 6px rgba(0,0,0,0.18)' }} />
            )
            : pages.map((page, i) => {
              const pageResume: ParsedResume = { ...parsedResume, sections: page.sections }
              return (
                <div
                  key={i}
                  style={{
                    width: A4_WIDTH,
                    height: A4_HEIGHT,
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: '#ffffff',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
                  }}
                >
                  <Suspense fallback={null}>
                    <TemplateComponent
                      resume={pageResume}
                      isPro={isPro}
                      showHeader={page.showHeader}
                    />
                  </Suspense>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}
