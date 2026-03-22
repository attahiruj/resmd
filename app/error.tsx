'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-mono text-muted uppercase tracking-widest">
            Something went wrong
          </p>
          <h1 className="text-2xl font-bold text-text">An error occurred</h1>
          <p className="text-sm text-muted leading-relaxed">
            We hit an unexpected error. Your work is safe — try refreshing or go
            back to the dashboard.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-accent text-accent-text text-sm font-medium hover:bg-accent-hover transition-colors duration-150"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 rounded-lg border border-border text-sm text-text hover:bg-surface transition-colors duration-150"
          >
            Go to dashboard
          </a>
        </div>

        {error.digest && (
          <p className="text-[10px] font-mono text-faint">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
