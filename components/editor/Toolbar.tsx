'use client'

import { useEffect, useState } from 'react'

interface ToolbarProps {
  onSave: () => void
  onExportPDF: () => void
  isSaving: boolean
  lastSaved: Date | null
  showAIPanel: boolean
  onToggleAI: () => void
}

export default function Toolbar({
  lastSaved,
  showAIPanel,
  onToggleAI,
}: ToolbarProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('resmd_theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (saved === 'dark' || (!saved && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('resmd_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('resmd_theme', 'light')
    }
  }

  const lastSavedLabel = lastSaved
    ? formatRelative(lastSaved)
    : null

  return (
    <div className="h-[52px] border-b border-border bg-surface flex items-center px-4 gap-2 flex-shrink-0">
      {/* Left: wordmark */}
      <span className="text-sm font-semibold text-text select-none tracking-tight">
        resmd
      </span>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 ml-auto">
        {lastSavedLabel && (
          <span className="text-xs text-muted mr-1 hidden sm:block">{lastSavedLabel}</span>
        )}

        {/* Dark/light toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full text-muted hover:text-text hover:bg-surface-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* AI sparkle toggle */}
        <button
          onClick={onToggleAI}
          className={`p-2.5 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            showAIPanel
              ? 'text-accent bg-accent-muted'
              : 'text-muted hover:text-text hover:bg-surface-2'
          }`}
          title="AI Assistant"
        >
          <SparkleIcon />
        </button>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Save — disabled until auth wired up in Stage 6 */}
        <button
          disabled
          title="Sign in to save"
          className="text-sm px-3 py-1.5 rounded-lg text-faint bg-surface-2 cursor-not-allowed select-none opacity-50"
        >
          Save
        </button>

        {/* Export PDF — disabled until Stage 9 */}
        <button
          disabled
          title="Coming soon"
          className="text-sm px-3 py-1.5 rounded-lg border border-border text-faint cursor-not-allowed select-none opacity-50"
        >
          Export PDF
        </button>
      </div>
    </div>
  )
}

function formatRelative(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 10) return 'Saved just now'
  if (diff < 60) return `Saved ${diff}s ago`
  if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`
  return `Saved ${Math.floor(diff / 3600)}h ago`
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
      <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5L5 3z" />
      <path d="M19 17l.5 1.5L21 19l-1.5.5L19 21l-.5-1.5L17 19l1.5-.5L19 17z" />
    </svg>
  )
}
