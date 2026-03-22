'use client';

import React, { useMemo, useRef, useEffect, useState, Suspense } from 'react';
import { parseResume } from '@/lib/parser';
import { getTemplate } from '@/lib/templates';
import { DEFAULT_SETTINGS } from '@/types/resume';
import type { ParsedResume, ResumeSection } from '@/types/resume';
import EmptyState from './EmptyState';

const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const PAGE_GAP = 20;
const PAGE_PADDING = 32;

interface LivePreviewProps {
  rawContent: string;
  templateId: string;
  onTextDoubleClick?: (word: string, context: string) => void;
}

interface PageSlice {
  showHeader: boolean;
  sections: ResumeSection[];
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
  usableHeight: number
): PageSlice[] {
  const bodySections = allSections.filter((s) => s !== headerSection);

  const pages: PageSlice[] = [];
  let currentBody: ResumeSection[] = [];
  let isFirst = true;
  let used = headerHeight; // first page pays the header cost upfront

  for (const section of bodySections) {
    const h = sectionHeights.get(section.id) ?? 0;
    // Flush current page if section doesn't fit (always keep at least one section per page)
    if (used + h > usableHeight && currentBody.length > 0) {
      pages.push({
        showHeader: isFirst,
        sections:
          isFirst && headerSection
            ? [headerSection, ...currentBody]
            : currentBody,
      });
      isFirst = false;
      currentBody = [];
      used = 0;
    }
    currentBody.push(section);
    used += h;
  }

  // Last (or only) page
  pages.push({
    showHeader: isFirst,
    sections:
      isFirst && headerSection ? [headerSection, ...currentBody] : currentBody,
  });

  return pages;
}

/**
 * Two-column layout pagination (e.g. Modern template).
 * Sidebar sections repeat on every page; only main sections are paginated.
 */
function buildTwoColumnPageSlices(
  allSections: ResumeSection[],
  headerSection: ResumeSection | null,
  sidebarSectionIds: Set<string>,
  mainSectionHeights: Map<string, number>,
  usableHeight: number
): PageSlice[] {
  const sidebarSections = allSections.filter(
    (s) => s !== headerSection && sidebarSectionIds.has(s.id)
  );
  const mainSections = allSections.filter(
    (s) => s !== headerSection && !sidebarSectionIds.has(s.id)
  );

  const pages: PageSlice[] = [];
  let currentMain: ResumeSection[] = [];
  let isFirst = true;
  let used = 0;

  const flush = () => {
    if (isFirst) {
      const base = headerSection ? [headerSection] : [];
      pages.push({
        showHeader: true,
        sections: [...base, ...sidebarSections, ...currentMain],
      });
    } else {
      // Subsequent pages: main content only, no sidebar repeat
      pages.push({
        showHeader: false,
        sections: [...currentMain],
      });
    }
    isFirst = false;
    currentMain = [];
    used = 0;
  };

  for (const section of mainSections) {
    const h = mainSectionHeights.get(section.id) ?? 0;
    if (used + h > usableHeight && currentMain.length > 0) {
      flush();
    }
    currentMain.push(section);
    used += h;
  }
  flush();

  return pages;
}

export default function LivePreview({
  rawContent,
  templateId,
  onTextDoubleClick,
}: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState<PageSlice[]>([]);

  const parsedResume = useMemo(() => parseResume(rawContent), [rawContent]);
  const template = getTemplate(templateId);

  // Scale to fill container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setScale((el.clientWidth - PAGE_PADDING * 2) / A4_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure rendered sections → assign to pages
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const update = () => {
      const marginV =
        parsedResume.settings?.marginV ?? DEFAULT_SETTINGS.marginV;
      const usableHeight = A4_HEIGHT - marginV * 2;

      // Header element height (includes its marginBottom)
      const headerEl = el.querySelector('[data-header]') as HTMLElement | null;
      const headerHeight = headerEl?.offsetHeight ?? 0;

      // Body sections: elements marked with data-section
      const sectionEls = Array.from(
        el.querySelectorAll('[data-section]')
      ) as HTMLElement[];
      const sectionHeights = new Map(
        sectionEls.map((node) => [node.dataset.section!, node.offsetHeight])
      );
      const bodySectionIds = new Set(sectionHeights.keys());

      // Identify header section as the one not measured as a body section
      const headerSection =
        parsedResume.sections.find((s) => !bodySectionIds.has(s.id)) ?? null;

      // Detect two-column layout (e.g. Modern): main sections are marked with data-main-section
      const mainSectionEls = Array.from(
        el.querySelectorAll('[data-main-section]')
      ) as HTMLElement[];

      let slices: PageSlice[];
      if (mainSectionEls.length > 0) {
        // Use scrollHeight of the main column to get true content height,
        // unaffected by flex-stretch from a taller sidebar column.
        const mainColEl = el.querySelector(
          '[data-main-col]'
        ) as HTMLElement | null;
        const mainColScrollHeight = mainColEl?.scrollHeight ?? 0;

        const mainIds = new Set(
          mainSectionEls.map((node) => node.dataset.mainSection!)
        );
        const sidebarIds = new Set(
          [...bodySectionIds].filter((id) => !mainIds.has(id))
        );

        if (mainColScrollHeight <= A4_HEIGHT) {
          // All main content fits on one page — avoid splitting.
          slices = [
            {
              showHeader: true,
              sections: parsedResume.sections,
            },
          ];
        } else {
          // Multi-page: paginate only by main-section heights.
          // scrollHeight on individual sections is also unaffected by flex-stretch.
          const mainSectionHeights = new Map(
            mainSectionEls.map((node) => [
              node.dataset.mainSection!,
              node.scrollHeight,
            ])
          );
          slices = buildTwoColumnPageSlices(
            parsedResume.sections,
            headerSection,
            sidebarIds,
            mainSectionHeights,
            usableHeight
          );
        }
      } else {
        slices = buildPageSlices(
          parsedResume.sections,
          headerSection,
          headerHeight,
          sectionHeights,
          usableHeight
        );
      }
      setPages(slices);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [parsedResume, templateId]);

  const isEmpty = !rawContent.trim() || !parsedResume.meta.name;

  if (isEmpty || !template) {
    return (
      <div className="flex items-center justify-center h-full p-8 bg-surface-2">
        <EmptyState />
      </div>
    );
  }

  const TemplateComponent = template.component;
  const numPages = Math.max(pages.length, 1);
  const totalUnscaledHeight =
    PAGE_PADDING +
    numPages * A4_HEIGHT +
    (numPages - 1) * PAGE_GAP +
    PAGE_PADDING;

  function handleDblClick(e: React.MouseEvent) {
    if (!onTextDoubleClick) return;
    requestAnimationFrame(() => {
      const sel = window.getSelection();
      const word = sel?.toString().trim();
      if (!word || !sel) return;

      let el: Element | null =
        sel.anchorNode?.nodeType === Node.ELEMENT_NODE
          ? (sel.anchorNode as Element)
          : (sel.anchorNode?.parentElement ?? null);
      let context = '';
      while (el && el !== e.currentTarget) {
        const display = window.getComputedStyle(el).display;
        if (
          display !== 'inline' &&
          display !== 'inline-block' &&
          display !== 'inline-flex'
        ) {
          context = el.textContent?.trim().replace(/^[–\-]\s*/, '') ?? '';
          break;
        }
        el = el.parentElement;
      }

      onTextDoubleClick(word, context);
    });
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto overflow-x-hidden bg-surface-2"
      onDoubleClick={handleDblClick}
    >
      {/* Hidden measurement div — renders the full template to measure section heights */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: 0,
          height: 0,
        }}
      >
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
            <TemplateComponent resume={parsedResume} showHeader />
          </Suspense>
        </div>
      </div>

      {/* Spacer sets scroll height; scaled pages sit inside it */}
      <div
        style={{ height: totalUnscaledHeight * scale, position: 'relative' }}
      >
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
          {pages.length === 0 ? (
            // Loading state while measurement runs
            <div
              style={{
                width: A4_WIDTH,
                height: A4_HEIGHT,
                background: '#ffffff',
                boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
              }}
            />
          ) : (
            pages.map((page, i) => {
              const pageResume: ParsedResume = {
                ...parsedResume,
                sections: page.sections,
              };
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
                      showHeader={page.showHeader}
                    />
                  </Suspense>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
