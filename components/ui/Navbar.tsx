import Link from 'next/link'
import { ReactNode } from 'react'

interface NavbarProps {
  /** Content inserted after the wordmark, preceded by a separator */
  left?: ReactNode
  /** Right-side content — consumer controls layout (ml-auto, flex, gap) */
  right?: ReactNode
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

      {right}
    </div>
  )
}
