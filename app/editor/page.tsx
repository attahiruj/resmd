'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Toolbar from '@/components/editor/Toolbar';
import PreviewPane from '@/components/preview/PreviewPane';
import AIChat from '@/components/editor/AIChat';

// CodeMirror is browser-only
const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false,
});

// AI panel is lazy-loaded — only downloaded when the user opens it
const AIPanel = dynamic(() => import('@/components/editor/AIPanel'), {
  ssr: false,
});

const DEFAULT_CONTENT = `# Bio
Name: Amara Osei
Title: Full Stack Engineer
Email: amara@example.com
Location: Lagos, Nigeria
GitHub: github.com/amaraosei
LinkedIn: linkedin.com/in/amaraosei

# Summary
Full stack engineer with 4 years building products across fintech and edtech.
Strong backend focus with React on the frontend. Passionate about developer tooling.

# Experience
## Senior Engineer @ Paystack | 2022 – Present
- Architected a transaction reconciliation service processing ₦2B daily
- Reduced API response time by 60% through query optimization and caching
- Mentored 3 junior engineers through a structured onboarding program

## Software Engineer @ Andela | 2020 – 2022
- Built React component library used across 12 client projects
- Led migration from REST to GraphQL, reducing over-fetching by 40%

# Education
## B.Sc Computer Science @ University of Lagos | 2016 – 2020
First Class Honours. Final year project: real-time collaborative code editor.

# Skills
Languages: TypeScript, Python, Go
Frontend: React, Next.js, Tailwind CSS
Backend: Node.js, FastAPI, PostgreSQL, Redis
Infrastructure: Docker, AWS, GitHub Actions

# Projects
## resmd | github.com/amara/resmd | 2024
Plain-text resume builder with live preview and AI enhancement.
- Built parser in TypeScript with zero dependencies
- 300+ GitHub stars in 6 weeks after launch

# Certifications
AWS Solutions Architect Associate | Amazon | 2023`;

const MIN_PANE_PX = 300;
const DEFAULT_SPLIT = 50;

type MobileTab = 'write' | 'preview';

export default function EditorPage() {
  const [rawContent, setRawContent] = useState(DEFAULT_CONTENT);
  const [templateId, setTemplateId] = useState('minimal');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [splitPct, setSplitPct] = useState(DEFAULT_SPLIT);
  const [mobileTab, setMobileTab] = useState<MobileTab>('write');
  const [isMounted, setIsMounted] = useState(false);

  // Refs for ref-based split drag (no re-renders during drag)
  const bodyRef = useRef<HTMLDivElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const splitPctRef = useRef(DEFAULT_SPLIT);

  // Load persisted state from localStorage after mount
  useEffect(() => {
    const savedContent = localStorage.getItem('resmd_draft');
    if (savedContent) setRawContent(savedContent);

    const savedSplit = localStorage.getItem('resmd_split');
    if (savedSplit) {
      const n = Number(savedSplit);
      if (!isNaN(n) && n >= 20 && n <= 80) {
        setSplitPct(n);
        splitPctRef.current = n;
      }
    }

    const savedTemplate = localStorage.getItem('resmd_template');
    if (savedTemplate) setTemplateId(savedTemplate);

    setIsMounted(true);
  }, []);

  const handleTemplateChange = useCallback((id: string) => {
    setTemplateId(id);
    localStorage.setItem('resmd_template', id);
  }, []);

  // Ref-based split drag: manipulate DOM directly during drag, commit to state on mouseup
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
      // Directly manipulate DOM for 60fps dragging
      if (leftPaneRef.current) leftPaneRef.current.style.width = `${next}%`;
      if (rightPaneRef.current)
        rightPaneRef.current.style.width = `${100 - next}%`;
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      // Commit final value to React state + localStorage
      const final = splitPctRef.current;
      setSplitPct(final);
      localStorage.setItem('resmd_split', String(final));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg">
      <Toolbar
        lastSaved={null}
        showAIPanel={showAIPanel}
        onToggleAI={() => setShowAIPanel((v) => !v)}
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
              {isMounted && (
                <Editor
                  value={rawContent}
                  onChange={setRawContent}
                  resumeContext={rawContent}
                />
              )}
            </div>
            <AIChat resumeContent={rawContent} />
          </div>
        ) : (
          <PreviewPane
            rawContent={rawContent}
            templateId={templateId}
            onTemplateChange={handleTemplateChange}
          />
        )}
      </div>

      {/* Desktop split-pane body (≥md) */}
      <div className="hidden md:flex flex-1 min-h-0 p-8">
        <div ref={bodyRef} className="flex flex-1 overflow-hidden rounded-xl">
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
                  onChange={setRawContent}
                  resumeContext={rawContent}
                />
              )}
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
            />
          </div>
        </div>
      </div>

      {/* AI panel - slide-in from right */}
      {showAIPanel && (
        <AIPanel
          rawContent={rawContent}
          onClose={() => setShowAIPanel(false)}
        />
      )}
    </div>
  );
}
