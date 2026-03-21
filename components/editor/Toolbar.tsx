'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  Warning,
} from '@phosphor-icons/react';
import { applyTheme, getStoredThemePrefs } from '@/lib/themes';
import { useProfile } from '@/hooks/useProfile';
import Navbar from '@/components/ui/Navbar';
import { hasPlaceholders } from '@/lib/inline';
import FeedbackModal from '@/components/ui/FeedbackModal';

interface ToolbarProps {
  lastSaved: Date | null;

  resumeTitle?: string;
  onTitleChange?: (title: string) => void;
  resumeId?: string;
  rawContent?: string;
}

export default function Toolbar({
  lastSaved,

  resumeTitle,
  onTitleChange,
  resumeId,
  rawContent,
}: ToolbarProps) {
  const [isDark, setIsDark] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showPlaceholderWarning, setShowPlaceholderWarning] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { user, profile } = useProfile();

  useEffect(() => {
    const { themeId, mode } = getStoredThemePrefs();
    applyTheme(themeId, mode);
    setIsDark(mode === 'dark');
  }, []);

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    const { themeId } = getStoredThemePrefs();
    applyTheme(themeId, newMode);
    setIsDark(!isDark);
  };

  const doExport = async () => {
    if (!resumeId || isExporting) return;
    setIsExporting(true);
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? 'resume.pdf';
      a.click();
      URL.revokeObjectURL(url);
      // Show feedback prompt once, after the user's first successful export
      if (!localStorage.getItem('resmd_exported_once')) {
        localStorage.setItem('resmd_exported_once', '1');
        setTimeout(() => setShowFeedback(true), 800);
      }
    } catch {
      // Silently fail — user sees nothing changed
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (!resumeId || isExporting) return;
    if (rawContent && hasPlaceholders(rawContent)) {
      setShowPlaceholderWarning(true);
    } else {
      doExport();
    }
  };

  const lastSavedLabel = lastSaved ? formatRelative(lastSaved) : null;
  const userInitial =
    (profile?.email?.[0] ?? user?.email?.[0] ?? '').toUpperCase() || null;

  return (
    <>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showPlaceholderWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface rounded-xl border border-border shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <Warning
                size={22}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <h2 className="text-base font-semibold text-text mb-1">
                  Unfilled placeholders detected
                </h2>
                <p className="text-sm text-muted">
                  Your resume contains{' '}
                  <span className="text-red-500 font-medium">
                    [bracketed placeholders]
                  </span>{' '}
                  that may be AI suggestions. These will appear in the exported
                  PDF.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPlaceholderWarning(false)}
                className="text-sm px-3 py-1.5 rounded-lg border border-border text-text hover:bg-surface-2 transition-colors duration-150"
              >
                Fix first
              </button>
              <button
                onClick={() => {
                  setShowPlaceholderWarning(false);
                  doExport();
                }}
                className="text-sm px-3 py-1.5 rounded-lg bg-accent text-white hover:opacity-90 transition-opacity duration-150"
              >
                Export anyway
              </button>
            </div>
          </div>
        </div>
      )}
      <Navbar
        left={
          resumeTitle !== undefined && onTitleChange ? (
            <input
              value={resumeTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
              }}
              className="text-base font-medium text-text bg-transparent px-1.5 py-0.5 rounded-md border border-transparent hover:border-border focus:border-accent focus:bg-surface-2 outline-none transition-colors duration-150 max-w-[260px]"
              placeholder="Untitled"
              title="Click to rename"
            />
          ) : undefined
        }
        right={
          <div className="flex items-center gap-1.5 ml-auto">
            {lastSavedLabel && (
              <span className="text-xs text-muted mr-1 hidden sm:block">
                {lastSavedLabel}
              </span>
            )}

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-muted hover:text-text hover:bg-surface-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            <button
              onClick={handleExportPDF}
              disabled={!resumeId || isExporting}
              title={
                !resumeId
                  ? 'Sign in to export'
                  : isExporting
                    ? 'Generating…'
                    : 'Export PDF'
              }
              className={`text-sm px-3 py-1.5 rounded-lg border border-border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                !resumeId || isExporting
                  ? 'text-faint cursor-not-allowed opacity-50'
                  : 'text-text hover:bg-surface-2'
              }`}
            >
              {isExporting ? 'Exporting…' : 'Export PDF'}
            </button>

            <Link
              href="/dashboard"
              title="Dashboard"
              className="ml-0.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {userInitial ? (
                <div className="w-8 h-8 rounded-full bg-accent-muted text-accent flex items-center justify-center text-sm font-semibold hover:bg-accent-muted-hover transition-colors duration-150">
                  {userInitial}
                </div>
              ) : (
                <div className="p-1.5 text-muted hover:text-text hover:bg-surface-2 rounded-full transition-colors duration-150">
                  <UserCircleIcon size={22} />
                </div>
              )}
            </Link>
          </div>
        }
      />
    </>
  );
}

function formatRelative(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 10) return 'Saved just now';
  if (diff < 60) return `Saved ${diff}s ago`;
  if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
  return `Saved ${Math.floor(diff / 3600)}h ago`;
}
