'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XIcon } from '@phosphor-icons/react';

const DISMISSED_KEY = 'resmd_guest_banner_dismissed';

export default function GuestBanner() {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const pathname = usePathname();

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(DISMISSED_KEY) === '1';
    setDismissed(wasDismissed);
  }, []);

  if (dismissed) return null;

  const signupHref = `/auth?signup=1&returnVariant=${pathname.split('/').pop()}`;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2 bg-accent-muted border-b border-border text-xs text-text flex-shrink-0">
      <span>
        Your resume won&apos;t be saved after you leave.{' '}
        <Link
          href={signupHref}
          className="font-medium text-accent hover:underline"
        >
          Create a free account
        </Link>{' '}
        to keep it.
      </span>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="text-muted hover:text-text transition-colors duration-150 flex-shrink-0"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
}
