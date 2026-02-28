'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SunIcon, MoonIcon, SparkleIcon, UserCircleIcon } from '@phosphor-icons/react'
import { applyTheme, getStoredThemePrefs } from '@/lib/themes'
import { useProfile } from '@/hooks/useProfile'

interface ToolbarProps {
  lastSaved: Date | null
  showAIPanel: boolean
  onToggleAI: () => void
  variantTitle?: string
  onTitleChange?: (title: string) => void
}

export default function Toolbar({
  lastSaved,
  showAIPanel,
  onToggleAI,
  variantTitle,
  onTitleChange,
}: ToolbarProps) {
  const [isDark, setIsDark] = useState(true)
  const { user, profile } = useProfile()

  useEffect(() => {
    const { themeId, mode } = getStoredThemePrefs()
    applyTheme(themeId, mode)
    setIsDark(mode === 'dark')
  }, [])

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark'
    const { themeId } = getStoredThemePrefs()
    applyTheme(themeId, newMode)
    setIsDark(!isDark)
  }

  const lastSavedLabel = lastSaved ? formatRelative(lastSaved) : null
  const userInitial =
    (profile?.email?.[0] ?? user?.email?.[0] ?? '').toUpperCase() || null

  return (
    <div className="h-[60px] border-b border-border bg-surface flex items-center px-5 gap-2 flex-shrink-0">
      {/* Left: wordmark */}
      <Link
        href="/dashboard"
        className="text-base font-bold text-text select-none tracking-tight hover:opacity-80 transition-opacity"
      >
        res<span className="text-accent">md</span>
      </Link>

      {/* Title */}
      {variantTitle !== undefined && onTitleChange && (
        <>
          <div className="w-px h-4 bg-border mx-1 flex-shrink-0" />
          <input
            value={variantTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
            className="text-sm text-text bg-transparent px-1.5 py-0.5 rounded-md border border-transparent hover:border-border focus:border-accent focus:bg-surface-2 outline-none transition-colors duration-150 max-w-[220px]"
            placeholder="Untitled"
            title="Click to rename"
          />
        </>
      )}

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
          {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
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
          <SparkleIcon size={18} />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Export PDF — disabled until Stage 9 */}
        <button
          disabled
          title="Coming soon"
          className="text-sm px-3 py-1.5 rounded-lg border border-border text-faint cursor-not-allowed select-none opacity-50"
        >
          Export PDF
        </button>

        {/* User profile link */}
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
