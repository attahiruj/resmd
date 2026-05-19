'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  GitBranchIcon,
} from '@phosphor-icons/react';
import Toolbar from '@/components/editor/Toolbar';
import PreviewPane from '@/components/preview/PreviewPane';
import TemplateCommandPalette from '@/components/preview/TemplateCommandPalette';
import CmdKPalette from '@/components/editor/CmdKPalette';
import AIChat from '@/components/editor/AIChat';
import ErrorBoundary from '@/components/editor/ErrorBoundary';
import GuestBanner from '@/components/editor/GuestBanner';
import CloneModal from '@/components/variants/CloneModal';
import type { Resume } from '@/types/resume';

// CodeMirror is browser-only
const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false,
});

const MIN_PANE_PX = 300;
const DEFAULT_SPLIT = 50;
const SPLIT_LARGE = 60;
const BREAKPOINT_LG = 1280;
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
  const router = useRouter();

  const [rawContent, setRawContent] = useState(resume.rawContent);
  const [templateId, setTemplateId] = useState(resume.templateId);
  const [resumeTitle, setResumeTitle] = useState(resume.title);

  const [splitPct, setSplitPct] = useState(DEFAULT_SPLIT);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('write');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showCmdK, setShowCmdK] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(true);
  // All related resumes (siblings + master) including current
  const [relatedResumes, setRelatedResumes] = useState<Resume[]>([resume]);
  const [variantsLoading, setVariantsLoading] = useState(!isGuest);
  // Track active resume ID independently so autosave targets the right record
  const activeResumeIdRef = useRef(resume.id);
  const [activeResumeId, setActiveResumeId] = useState(resume.id);

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
    // Restore or set split percentage
    const savedSplit = localStorage.getItem('resmd_split');
    if (savedSplit) {
      const n = Number(savedSplit);
      if (!isNaN(n) && n >= 20 && n <= 80) {
        setSplitPct(n);
        splitPctRef.current = n;
      }
    } else if (window.innerWidth >= BREAKPOINT_LG) {
      setSplitPct(SPLIT_LARGE);
      splitPctRef.current = SPLIT_LARGE;
    }

    // Restore preview collapsed state or default by screen size
    const savedCollapsed = localStorage.getItem('resmd_preview_collapsed');
    if (savedCollapsed !== null) {
      setPreviewCollapsed(savedCollapsed === '1');
    }

    // Collapse variants rail on smaller screens
    if (window.innerWidth < BREAKPOINT_LG) {
      setVariantsOpen(false);
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

  // Fetch all resumes for the side panel
  useEffect(() => {
    if (isGuest) return;
    fetch('/api/resumes')
      .then((r) => r.json())
      .then(({ data }) => {
        if (!Array.isArray(data)) return;
        const all = data as Resume[];
        // Ensure current resume appears with latest in-memory content
        const withCurrent = all.some((r) => r.id === resume.id)
          ? all
          : [resume, ...all];
        setRelatedResumes(withCurrent);
      })
      .catch(() => {})
      .finally(() => setVariantsLoading(false));
  }, [resume.id, isGuest]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExportPDF = useCallback(async () => {
    if (!resume.id) return;
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: resume.id }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? 'resume.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail
    }
  }, [resume.id]);

  const autosave = useCallback(async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/resumes/${activeResumeIdRef.current}`, {
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
  }, []);

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

  const handleReplaceResume = useCallback(
    (content: string) => {
      setRawContent(content);
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

  const handleTitleChange = useCallback((title: string) => {
    setResumeTitle(title);
    if (titleSaveTimerRef.current) clearTimeout(titleSaveTimerRef.current);
    titleSaveTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/resumes/${activeResumeIdRef.current}`, {
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
  }, []);

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

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 't') {
        e.preventDefault();
        setShowTemplatePicker((v) => !v);
      }
      if (mod && e.key === 'k') {
        e.preventDefault();
        setShowCmdK((v) => !v);
      }
      if (mod && e.key === 'e') {
        e.preventDefault();
        handleExportPDF();
      }
      if (mod && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowCloneModal(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleExportPDF]);

  const handleCloneAndTailor = useCallback(() => {
    setShowCloneModal(true);
  }, []);

  const handleDeleteResume = useCallback(
    async (id: string) => {
      const isActive = id === activeResumeIdRef.current;
      // Optimistically remove from list
      setRelatedResumes((prev) => prev.filter((r) => r.id !== id));
      try {
        await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      } catch {
        // Restore on failure — re-fetch
        fetch('/api/resumes')
          .then((r) => r.json())
          .then(({ data }) => {
            if (Array.isArray(data)) setRelatedResumes(data as Resume[]);
          })
          .catch(() => {});
        return;
      }
      // If the deleted resume was the active one, go to dashboard
      if (isActive) router.push('/dashboard');
    },
    [router]
  );

  const handleJumpToSection = useCallback((word: string) => {
    setMobileTab('write');
    setJumpTarget({ word, context: '' });
  }, []);

  // In-place variant switch — no page reload
  const handleSelectVariant = useCallback(
    (id: string) => {
      if (id === activeResumeIdRef.current) return;
      const target = relatedResumes.find((r) => r.id === id);
      if (!target) return;
      // Flush any pending autosave for the outgoing resume first
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
        autosave();
      }
      activeResumeIdRef.current = id;
      setActiveResumeId(id);
      setRawContent(target.rawContent);
      setTemplateId(target.templateId);
      setResumeTitle(target.title);
      setLastSaved(null);
      router.replace(`/editor/${id}`, { scroll: false });
    },
    [relatedResumes, autosave, router]
  );

  const handleCloneConfirm = useCallback(
    async (title: string, targetRoleDescription?: string) => {
      setIsCloning(true);
      try {
        const response = await fetch(
          `/api/resumes/${activeResumeIdRef.current}/clone`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, targetRoleDescription }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to clone resume');
        }

        const { data: newResume } = await response.json();
        // Redirect to the new resume
        window.location.href = `/editor/${newResume.id}`;
      } catch (error) {
        console.error('Clone failed:', error);
        // TODO: Show error toast to user
      } finally {
        setIsCloning(false);
        setShowCloneModal(false);
      }
    },
    [setIsCloning, setShowCloneModal]
  );

  return (
    <ErrorBoundary>
      <main className="flex flex-col h-dvh overflow-hidden bg-bg">
        <Toolbar
          lastSaved={lastSaved}
          resumeTitle={resumeTitle}
          onTitleChange={handleTitleChange}
          resumeId={resume.id}
          rawContent={rawContent}
          onCloneAndTailor={handleCloneAndTailor}
          templateId={templateId}
          onTemplateChange={handleTemplateChange}
        />
        {isGuest && <GuestBanner />}

        {/* Mobile tab bar (<md) */}
        <div className="xl:hidden flex h-12 border-b border-border bg-surface flex-shrink-0 px-2 gap-1 items-center">
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

        {/* Single-pane body (mobile + tablet) */}
        <div
          className="xl:hidden relative flex-1 overflow-hidden min-h-0"
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
          <div
            className={`h-full flex flex-col bg-editor-bg ${mobileTab === 'write' ? '' : 'hidden'}`}
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
              onReplaceResume={handleReplaceResume}
              isGuest={isGuest}
            />
          </div>
          <div className={mobileTab === 'preview' ? 'h-full' : 'hidden'}>
            <PreviewPane
              rawContent={rawContent}
              templateId={templateId}
              onTemplateChange={handleTemplateChange}
              onContentChange={handleContentChange}
              onTextDoubleClick={handlePreviewDoubleClick}
              onOpenTemplatePicker={() => setShowTemplatePicker(true)}
            />
          </div>
        </div>

        {/* Desktop split-pane body (≥xl) */}
        <div className="hidden xl:flex flex-1 min-h-0 p-4 gap-3">
          {/* Variants rail — always mounted for authenticated users */}
          {!isGuest && (
            <VariantsRail
              open={variantsOpen}
              onToggle={() => setVariantsOpen((v) => !v)}
              resumes={relatedResumes}
              currentId={activeResumeId}
              loading={variantsLoading}
              onSelect={handleSelectVariant}
              onClone={handleCloneAndTailor}
              onDelete={handleDeleteResume}
            />
          )}

          <div
            ref={bodyRef}
            className="flex flex-1 overflow-hidden rounded-xl border border-border"
          >
            {/* Editor pane */}
            <div
              ref={leftPaneRef}
              className="flex flex-col overflow-hidden flex-shrink-0 bg-editor-bg"
              style={{ width: previewCollapsed ? '100%' : `${splitPct}%` }}
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
                onReplaceResume={handleReplaceResume}
                isGuest={isGuest}
              />
            </div>

            {/* Drag divider / preview toggle */}
            <div
              className="relative w-1 flex-shrink-0 bg-border select-none flex items-center justify-center group"
              style={{ cursor: previewCollapsed ? 'default' : 'col-resize' }}
              onMouseDown={
                previewCollapsed ? undefined : handleDividerMouseDown
              }
            >
              <button
                className="absolute z-10 hidden xl:flex items-center justify-center w-5 h-8 rounded bg-border hover:bg-accent transition-colors duration-150 opacity-0 group-hover:opacity-100"
                onClick={() =>
                  setPreviewCollapsed((v) => {
                    const next = !v;
                    localStorage.setItem(
                      'resmd_preview_collapsed',
                      next ? '1' : '0'
                    );
                    return next;
                  })
                }
              >
                {previewCollapsed ? (
                  <CaretLeftIcon size={10} />
                ) : (
                  <CaretRightIcon size={10} />
                )}
              </button>
            </div>

            {/* Preview pane */}
            {!previewCollapsed && (
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
                  onOpenTemplatePicker={() => setShowTemplatePicker(true)}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ⌘K command palette */}
      {showCmdK && (
        <CmdKPalette
          rawContent={rawContent}
          templateId={templateId}
          resumeId={resume.id}
          onExportPDF={() => {
            setShowCmdK(false);
            handleExportPDF();
          }}
          onCloneAndTailor={() => {
            setShowCmdK(false);
            handleCloneAndTailor();
          }}
          onSelectTemplate={(id) => {
            handleTemplateChange(id);
            setShowCmdK(false);
          }}
          onJumpToSection={handleJumpToSection}
          onClose={() => setShowCmdK(false)}
        />
      )}

      {/* Template command palette */}
      {showTemplatePicker && (
        <TemplateCommandPalette
          rawContent={rawContent}
          templateId={templateId}
          onSelect={(id) => {
            handleTemplateChange(id);
            setShowTemplatePicker(false);
          }}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* Clone Modal */}
      {showCloneModal && (
        <CloneModal
          sourceResume={resume}
          onConfirm={handleCloneConfirm}
          onClose={() => setShowCloneModal(false)}
          loading={isCloning}
        />
      )}
    </ErrorBoundary>
  );
}

function VariantRow({
  title,
  active,
  onClick,
  onDelete,
}: {
  title: string;
  active?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-colors duration-150 group ${
        active ? 'bg-accent/10' : 'hover:bg-surface-2'
      }`}
    >
      {/* Active indicator dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
          active ? 'bg-accent' : 'bg-border group-hover:bg-muted'
        }`}
      />

      {/* Title — click to switch */}
      <button
        onClick={onClick}
        disabled={active}
        title={title}
        className={`min-w-0 flex-1 text-left text-xs leading-snug truncate transition-colors ${
          active
            ? 'text-accent font-semibold cursor-default'
            : 'text-muted hover:text-text cursor-pointer'
        }`}
      >
        {title}
      </button>

      {/* Delete control — appears on hover */}
      {onDelete &&
        !active &&
        (confirmDelete ? (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-[10px] text-red-400 hover:text-red-300 font-medium transition-colors leading-none"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[10px] text-muted hover:text-text transition-colors leading-none"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all text-[11px] leading-none flex-shrink-0"
            title="Delete"
          >
            ✕
          </button>
        ))}
    </div>
  );
}

function VariantsRail({
  open,
  onToggle,
  resumes,
  currentId,
  loading,
  onSelect,
  onClone,
  onDelete,
}: {
  open: boolean;
  onToggle: () => void;
  resumes: Resume[];
  currentId: string;
  loading: boolean;
  onSelect: (id: string) => void;
  onClone: () => void;
  onDelete: (id: string) => void;
}) {
  const SKELETON_COUNT = 3;

  if (!open) {
    return (
      <div className="flex flex-col items-center bg-surface border border-border rounded-xl flex-shrink-0 w-8 py-2 gap-1.5 overflow-hidden">
        <button
          onClick={onToggle}
          className="w-5 h-5 flex items-center justify-center text-muted hover:text-text transition-colors"
          title="Show resumes"
        >
          <CaretRightIcon size={12} />
        </button>
        <div className="w-4 h-px bg-border my-0.5" />
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="w-5 h-3 rounded-full bg-border animate-pulse"
              />
            ))
          : resumes
              .slice(0, 8)
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  title={r.title}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    r.id === currentId
                      ? 'bg-accent'
                      : 'bg-border hover:bg-muted'
                  }`}
                />
              ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface border border-border rounded-xl flex-shrink-0 w-[168px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-3 py-2.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <GitBranchIcon size={11} className="text-muted flex-shrink-0" />
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
            Resumes
          </span>
        </div>
        <button
          onClick={onToggle}
          className="w-4 h-4 flex items-center justify-center text-muted hover:text-text transition-colors"
          title="Collapse"
        >
          <CaretLeftIcon size={11} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-1.5 py-2 flex flex-col gap-0.5">
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="px-3 py-2 flex items-center gap-2.5 animate-pulse"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-border flex-shrink-0" />
                <div className="h-2.5 w-3/4 rounded-full bg-border" />
              </div>
            ))
          : resumes.map((r) => (
              <VariantRow
                key={r.id}
                title={r.title}
                active={r.id === currentId}
                onClick={r.id === currentId ? undefined : () => onSelect(r.id)}
                onDelete={() => onDelete(r.id)}
              />
            ))}

        {!loading && (
          <button
            onClick={onClone}
            className="mt-1 mx-1.5 rounded-lg border border-dashed border-border py-2 text-center hover:border-accent/50 hover:bg-accent/5 transition-colors duration-150 group"
          >
            <span className="text-[10px] text-muted group-hover:text-accent transition-colors">
              + clone
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
