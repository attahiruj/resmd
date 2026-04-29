'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  MagnifyingGlassIcon,
  ListIcon,
  SlideshowIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@phosphor-icons/react';
import { getAllTemplates } from '@/lib/templates';
import { parseResume } from '@/lib/parser';

const A4_WIDTH = 595;

const LIST_THUMB_W = 108;
const LIST_THUMB_SCALE = LIST_THUMB_W / A4_WIDTH;
const LIST_THUMB_H = Math.round((LIST_THUMB_W / 595) * 842);

const CAROUSEL_THUMB_W = 560;
const CAROUSEL_THUMB_SCALE = CAROUSEL_THUMB_W / A4_WIDTH;
const CAROUSEL_THUMB_H = Math.round((CAROUSEL_THUMB_W / A4_WIDTH) * 842);

type ViewMode = 'list' | 'carousel';

interface TemplateCommandPaletteProps {
  rawContent: string;
  templateId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

function Thumbnail({
  component: TemplateComponent,
  parsedResume,
  width,
  height,
  scale,
}: {
  component: React.ComponentType<{
    resume: ReturnType<typeof parseResume>;
    showHeader?: boolean;
  }>;
  parsedResume: ReturnType<typeof parseResume>;
  width: number;
  height: number;
  scale: number;
}) {
  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{ width, height, textAlign: 'left' }}
    >
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        }
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: A4_WIDTH,
            textAlign: 'left',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
        >
          <TemplateComponent resume={parsedResume} showHeader />
        </div>
      </Suspense>
    </div>
  );
}

export default function TemplateCommandPalette({
  rawContent,
  templateId,
  onSelect,
  onClose,
}: TemplateCommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return (
        (localStorage.getItem('resmd_template_view') as ViewMode) ?? 'list'
      );
    } catch {
      return 'list';
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const templates = getAllTemplates();
  const parsedResume = useMemo(() => parseResume(rawContent), [rawContent]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    templates.forEach((t) => seen.add(t.category));
    return ['all', ...Array.from(seen)];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      const matchCat =
        activeCategory === 'all' || t.category === activeCategory;
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [templates, search, activeCategory]);

  const clampedIdx = Math.min(focusedIndex, Math.max(0, filtered.length - 1));

  useEffect(() => {
    setFocusedIndex(0);
  }, [search, activeCategory]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll focused list item into view
  useEffect(() => {
    if (viewMode === 'list') {
      itemRefs.current[clampedIdx]?.scrollIntoView({ block: 'nearest' });
    }
  }, [clampedIdx, viewMode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const tpl = filtered[clampedIdx];
        if (tpl) onSelect(tpl.id);
        return;
      }
      const goNext =
        viewMode === 'carousel'
          ? e.key === 'ArrowRight' || e.key === 'ArrowDown'
          : e.key === 'ArrowDown';
      const goPrev =
        viewMode === 'carousel'
          ? e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          : e.key === 'ArrowUp';
      if (goNext) {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (goPrev) {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [filtered, clampedIdx, viewMode, onClose, onSelect]);

  const currentTpl = filtered[clampedIdx];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-[640px] max-w-[calc(100vw-2rem)] mx-4 bg-surface border border-border-strong rounded-xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search + toggle */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <MagnifyingGlassIcon size={18} className="text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Switch template..."
            className="flex-1 bg-transparent text-base text-text placeholder:text-muted outline-none"
          />
          <div className="flex items-center gap-0.5 bg-surface-2 border border-border rounded-lg p-0.5 flex-shrink-0">
            <button
              onClick={() => {
                setViewMode('list');
                try {
                  localStorage.setItem('resmd_template_view', 'list');
                } catch {}
              }}
              title="List view"
              className={`p-1.5 rounded-md transition-colors duration-150 ${viewMode === 'list' ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text'}`}
            >
              <ListIcon size={14} />
            </button>
            <button
              onClick={() => {
                setViewMode('carousel');
                try {
                  localStorage.setItem('resmd_template_view', 'carousel');
                } catch {}
              }}
              title="Carousel view"
              className={`p-1.5 rounded-md transition-colors duration-150 ${viewMode === 'carousel' ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text'}`}
            >
              <SlideshowIcon size={14} />
            </button>
          </div>
          <kbd className="px-2 py-1 bg-surface-2 border border-border rounded text-xs text-faint font-sans leading-none">
            esc
          </kbd>
        </div>

        {/* Category pills */}
        <div
          className="flex gap-2 px-5 py-3 border-b border-border overflow-x-auto flex-shrink-0"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-none px-3.5 py-1.5 rounded-full text-sm capitalize transition-colors duration-150 ${
                activeCategory === cat
                  ? 'bg-surface-2 border border-border text-text'
                  : 'text-muted hover:text-text'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {/* LIST view */}
        {viewMode === 'list' && (
          <div className="h-[560px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted">No templates match</p>
              </div>
            ) : (
              filtered.map((tpl, i) => {
                const isCurrent = tpl.id === templateId;
                const isFocused = i === clampedIdx;
                return (
                  <button
                    key={tpl.id}
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    onClick={() => onSelect(tpl.id)}
                    onMouseEnter={() => setFocusedIndex(i)}
                    className={`w-full flex items-center gap-5 px-5 py-3.5 text-left transition-colors duration-100 border-l-2 ${
                      isFocused
                        ? 'bg-surface-2 border-accent'
                        : 'bg-transparent border-transparent'
                    }`}
                  >
                    <div
                      className={`relative flex-shrink-0 rounded border overflow-hidden ${isFocused ? 'border-accent/50' : 'border-border'}`}
                      style={{ width: LIST_THUMB_W, height: LIST_THUMB_H }}
                    >
                      <Thumbnail
                        component={tpl.component}
                        parsedResume={parsedResume}
                        width={LIST_THUMB_W}
                        height={LIST_THUMB_H}
                        scale={LIST_THUMB_SCALE}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[15px] font-medium truncate ${isCurrent ? 'text-accent' : 'text-text'}`}
                      >
                        {tpl.name}
                      </p>
                      <p className="text-sm text-muted truncate mt-0.5">
                        {tpl.description}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="text-sm text-accent flex-shrink-0">
                        current
                      </span>
                    )}
                    {!isCurrent && isFocused && (
                      <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs text-faint font-sans leading-none flex-shrink-0">
                        ↵
                      </kbd>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* CAROUSEL view */}
        {viewMode === 'carousel' && (
          <div className="h-[560px] flex flex-col py-5 gap-4">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">
                No templates match
              </p>
            ) : (
              <>
                {/* Full-width thumbnail with overlay arrows */}
                <div
                  className="relative mx-auto flex-1 min-h-0"
                  style={{ width: CAROUSEL_THUMB_W }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => currentTpl && onSelect(currentTpl.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        currentTpl && onSelect(currentTpl.id);
                      }
                    }}
                    className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-150 ${
                      currentTpl?.id === templateId
                        ? 'border-accent shadow-[0_0_0_3px] shadow-accent/20'
                        : 'border-border hover:border-accent/60'
                    }`}
                    style={{ width: CAROUSEL_THUMB_W, height: '100%' }}
                  >
                    {currentTpl && (
                      <Thumbnail
                        component={currentTpl.component}
                        parsedResume={parsedResume}
                        width={CAROUSEL_THUMB_W}
                        height={CAROUSEL_THUMB_H}
                        scale={CAROUSEL_THUMB_SCALE}
                      />
                    )}
                  </div>

                  <button
                    onClick={() => setFocusedIndex((i) => Math.max(i - 1, 0))}
                    disabled={clampedIdx === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <CaretLeftIcon size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setFocusedIndex((i) =>
                        Math.min(i + 1, filtered.length - 1)
                      )
                    }
                    disabled={clampedIdx === filtered.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <CaretRightIcon size={16} />
                  </button>
                </div>

                {/* Name + description */}
                <div className="px-5">
                  <p
                    className={`text-base font-semibold ${currentTpl?.id === templateId ? 'text-accent' : 'text-text'}`}
                  >
                    {currentTpl?.name}
                    {currentTpl?.id === templateId && (
                      <span className="ml-2 text-sm font-normal text-accent/60">
                        current
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted mt-0.5">
                    {currentTpl?.description}
                  </p>
                </div>

                {/* Dot indicators + counter */}
                <div className="flex items-center gap-3 px-5">
                  <div className="flex items-center gap-1.5">
                    {filtered.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFocusedIndex(i)}
                        className={`rounded-full transition-all duration-150 ${
                          i === clampedIdx
                            ? 'w-4 h-1.5 bg-accent'
                            : 'w-1.5 h-1.5 bg-border hover:bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-faint">
                    {clampedIdx + 1} / {filtered.length}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-5 px-5 py-3 border-t border-border bg-surface-2 flex-shrink-0">
          {(viewMode === 'carousel'
            ? [
                { keys: ['←', '→'], label: 'navigate' },
                { keys: ['↵'], label: 'apply' },
                { keys: ['esc'], label: 'cancel' },
              ]
            : [
                { keys: ['↑', '↓'], label: 'navigate' },
                { keys: ['↵'], label: 'apply' },
                { keys: ['esc'], label: 'cancel' },
              ]
          ).map(({ keys, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {keys.map((k, i) => (
                  <kbd
                    key={i}
                    className="px-2 py-1 bg-surface border border-border rounded text-xs text-muted font-sans leading-none"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
              <span className="text-xs text-faint">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
