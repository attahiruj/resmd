'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  SunIcon,
  MoonIcon,
  GearIcon,
  ChatTeardropTextIcon,
  QuestionIcon,
  CoffeeIcon,
  SignOutIcon,
} from '@phosphor-icons/react';

interface AvatarDropdownProps {
  email: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onShowFeedback: () => void;
  onSignOut: () => void;
}

export default function AvatarDropdown({
  email,
  isDark,
  onToggleTheme,
  onShowFeedback,
  onSignOut,
}: AvatarDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = email?.[0]?.toUpperCase() || '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-bold ring-1 ring-accent/40 hover:bg-accent/25 hover:ring-accent/70 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title="Account"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-30">
          {/* Email header */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[11px] text-muted truncate">{email}</p>
          </div>

          {/* Primary */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="w-full px-4 py-2 text-left text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors"
            >
              <GearIcon size={15} />
              Settings
            </Link>
            <button
              onClick={onToggleTheme}
              className="w-full px-4 py-2 text-left text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors"
            >
              {isDark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>
          </div>

          {/* Secondary */}
          <div className="border-t border-border py-1">
            <button
              onClick={() => {
                onShowFeedback();
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors"
            >
              <ChatTeardropTextIcon size={15} />
              Feedback
            </button>
            <Link
              href="/help"
              onClick={() => setOpen(false)}
              className="w-full px-4 py-2 text-left text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors"
            >
              <QuestionIcon size={15} />
              Help
            </Link>
            <a
              href="https://buymeacoffee.com/hattahiroo"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="w-full px-4 py-2 text-left text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors block"
            >
              <CoffeeIcon size={15} />
              Support resmd
            </a>
          </div>

          {/* Sign out */}
          <div className="border-t border-border py-1">
            <button
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger/5 flex items-center gap-2.5 transition-colors"
            >
              <SignOutIcon size={15} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
