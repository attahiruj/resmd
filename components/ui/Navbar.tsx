import Link from 'next/link';
import { ReactNode } from 'react';
import { CoffeeIcon } from '@phosphor-icons/react';

interface NavbarProps {
  /** Content inserted after the wordmark, preceded by a separator */
  left?: ReactNode;
  /** Right-side content — consumer controls layout (ml-auto, flex, gap) */
  right?: ReactNode;
}

export default function Navbar({ left, right }: NavbarProps) {
  return (
    <div className="h-[60px] border-b border-border bg-surface flex items-center px-5 gap-2 flex-shrink-0">
      <Link
        href="/dashboard"
        className="text-xl font-bold text-text select-none tracking-tight hover:opacity-80 transition-opacity"
      >
        res<span className="text-accent">md</span>
      </Link>

      {left && (
        <>
          <div className="w-px h-5 bg-border mx-1.5 flex-shrink-0" />
          {left}
        </>
      )}

      <div className="ml-auto flex items-center gap-3 flex-shrink-0">
        <a
          href="https://buymeacoffee.com/hattahiroo"
          target="_blank"
          rel="noopener noreferrer"
          className="items-center gap-1.5 text-xs text-muted hover:text-text transition-colors duration-150 hidden sm:flex"
          title="Support resmd"
        >
          <CoffeeIcon size={14} />
          Support
        </a>

        {right}
      </div>
    </div>
  );
}
