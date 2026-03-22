'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';
import Toolbar from '@/components/editor/Toolbar';
import PreviewPane from '@/components/preview/PreviewPane';
import AIChat from '@/components/editor/AIChat';
import ErrorBoundary from '@/components/editor/ErrorBoundary';
import GuestBanner from '@/components/editor/GuestBanner';
import type { Resume } from '@/types/resume';

// CodeMirror is browser-only
const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false,
});

const MIN_PANE_PX = 300;
const DEFAULT_SPLIT = 50;
const AUTOSAVE_DELAY = 2000;

type MobileTab = 'write' | 'preview';

interface EditorClientProps {
  resume: Resume;
  isGuest?: boolean;
}

export default function EditorClient({
  resume,
  isGuest = false,
}: EditorClientProps) {
  const [rawContent, setRawContent] = useState(resume.rawContent);
  const [templateId, setTemplateId] = useState(resume.templateId);
  const [resumeTitle, setResumeTitle] = useState(resume.title);

  const [splitPct, setSplitPct] = useState(DEFAULT_SPLIT);
  const [mobileTab, setMobileTab] = useState<MobileTab>('write');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [aiMinimizeSignal, setAiMinimizeSignal] = useState(0);

  const [jumpTarget, setJumpTarget] = useState<{
    word: string;
    context: string;
  } | null>(null);

  // Touch swipe for mobile tab switching
  const swipeTouchRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    swipeTouchRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swipeTouchRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - swipeTouchRef.current.x;
      const dy = t.clientY - swipeTouchRef.current.y;
      swipeTouchRef.current = null;
      // Ignore if more vertical than horizontal, or too short
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0)
        setMobileTab('preview'); // swipe left → preview
      else setMobileTab('write'); // swipe right → write
      // Dismiss hint on first successful swipe
      if (showSwipeHint) {
        setShowSwipeHint(false);
        localStorage.setItem('resmd_swipe_hint_seen', '1');
      }
    },
    [showSwipeHint]
  );

  // Refs for 60fps split drag
  const bodyRef = useRef<HTMLDivElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const splitPctRef = useRef(DEFAULT_SPLIT);

  // Refs to capture latest values in debounced autosave
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rawContentRef = useRef(rawContent);
  const templateIdRef = useRef(templateId);
  const resumeTitleRef = useRef(resumeTitle);
  rawContentRef.current = rawContent;
  templateIdRef.current = templateId;
  resumeTitleRef.current = resumeTitle;

  useEffect(() => {
    const savedSplit = localStorage.getItem('resmd_split');
    if (savedSplit) {
      const n = Number(savedSplit);
      if (!isNaN(n) && n >= 20 && n <= 80) {
        setSplitPct(n);
        splitPctRef.current = n;
      }
    }
    setIsMounted(true);

    // Show swipe hint once on mobile
    if (
      window.innerWidth < 768 &&
      !localStorage.getItem('resmd_swipe_hint_seen')
    ) {
      setShowSwipeHint(true);
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem('resmd_swipe_hint_seen', '1');
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, []);

  const autosave = useCallback(async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/resumes/${resume.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: rawContentRef.current,
          templateId: templateIdRef.current,
        }),
      });
      setLastSaved(new Date());
    } catch {
      // Silently fail autosave
    } finally {
      setIsSaving(false);
    }
  }, [resume.id]);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(autosave, AUTOSAVE_DELAY);
  }, [autosave]);

  const handleContentChange = useCallback(
    (value: string) => {
      setRawContent(value);
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  const handleApplyEdit = useCallback(
    (search: string, replace: string) => {
      setRawContent((prev) => {
        if (!prev.includes(search)) return prev;
        return prev.replace(search, replace);
      });
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  const handlePreviewDoubleClick = useCallback(
    (word: string, context: string) => {
      setMobileTab('write');
      setJumpTarget({ word, context });
    },
    []
  );

  const handleTemplateChange = useCallback(
    (id: string) => {
      setTemplateId(id);
      localStorage.setItem('resmd_template', id);
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      setResumeTitle(title);
      if (titleSaveTimerRef.current) clearTimeout(titleSaveTimerRef.current);
      titleSaveTimerRef.current = setTimeout(async () => {
        try {
          await fetch(`/api/resumes/${resume.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rawContent: rawContentRef.current,
              templateId: templateIdRef.current,
              title,
            }),
          });
          setLastSaved(new Date());
        } catch {
          // Silently fail
        }
      }, 800);
    },
    [resume.id]
  );

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startPct = splitPctRef.current;

    const onMouseMove = (ev: MouseEvent) => {
      const totalWidth = bodyRef.current?.offsetWidth ?? window.innerWidth;
      const minPct = (MIN_PANE_PX / totalWidth) * 100;
      const maxPct = 100 - minPct;
      const delta = ((ev.clientX - startX) / totalWidth) * 100;
      const next = Math.max(minPct, Math.min(maxPct, startPct + delta));
      splitPctRef.current = next;
      if (leftPaneRef.current) leftPaneRef.current.style.width = `${next}%`;
      if (rightPaneRef.current)
        rightPaneRef.current.style.width = `${100 - next}%`;
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      const final = splitPctRef.current;
      setSplitPct(final);
      localStorage.setItem('resmd_split', String(final));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-dvh overflow-hidden bg-bg">
        <Toolbar
          lastSaved={lastSaved}
          resumeTitle={resumeTitle}
          onTitleChange={handleTitleChange}
          resumeId={resume.id}
          rawContent={rawContent}
        />
        {isGuest && <GuestBanner />}

        {/* Mobile tab bar (<md) */}
        <div className="md:hidden flex h-12 border-b border-border bg-surface flex-shrink-0 px-2 gap-1 items-center">
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
        <div
          className="md:hidden relative flex-1 overflow-hidden min-h-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {showSwipeHint && (
            <div className="absolute inset-x-0 bottom-32 flex justify-center z-20 pointer-events-none">
              <div className="flex items-center gap-2.5 bg-bg/90 backdrop-blur-sm border border-border text-text text-xs px-4 py-2.5 rounded-full shadow-lg animate-pulse">
                <ArrowLeftIcon size={13} className="text-accent" />
                <span>Swipe to switch view</span>
                <ArrowRightIcon size={13} className="text-accent" />
              </div>
            </div>
          )}
          {mobileTab === 'write' ? (
            <div className="h-full flex flex-col bg-editor-bg">
              <div
                className="flex-1 min-h-0 overflow-hidden"
                onClick={() => setAiMinimizeSignal((s) => s + 1)}
              >
                {isMounted && (
                  <Editor
                    value={rawContent}
                    onChange={handleContentChange}
                    jumpTarget={jumpTarget}
                    onJumpComplete={() => setJumpTarget(null)}
                    resumeContext={rawContent}
                    onEnhance={handleApplyEdit}
                  />
                )}
              </div>
              <AIChat
                resumeContent={rawContent}
                onApplyEdit={handleApplyEdit}
                isGuest={isGuest}
                minimizeSignal={aiMinimizeSignal}
              />
            </div>
          ) : (
            <PreviewPane
              rawContent={rawContent}
              templateId={templateId}
              onTemplateChange={handleTemplateChange}
              onContentChange={handleContentChange}
              onTextDoubleClick={handlePreviewDoubleClick}
            />
          )}
        </div>

        {/* Desktop split-pane body (≥md) */}
        <div className="hidden md:flex flex-1 min-h-0 p-8">
          <div
            ref={bodyRef}
            className="flex flex-1 overflow-hidden rounded-xl border border-border"
          >
            {/* Editor pane */}
            <div
              ref={leftPaneRef}
              className="flex flex-col overflow-hidden flex-shrink-0 bg-editor-bg"
              style={{ width: `${splitPct}%` }}
            >
              <div className="flex-1 min-h-0 overflow-hidden">
                {isMounted && (
                  <Editor
                    value={rawContent}
                    onChange={handleContentChange}
                    jumpTarget={jumpTarget}
                    onJumpComplete={() => setJumpTarget(null)}
                    resumeContext={rawContent}
                    onEnhance={handleApplyEdit}
                  />
                )}
              </div>
              <AIChat
                resumeContent={rawContent}
                onApplyEdit={handleApplyEdit}
                isGuest={isGuest}
              />
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
                onContentChange={handleContentChange}
                onTextDoubleClick={handlePreviewDoubleClick}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
