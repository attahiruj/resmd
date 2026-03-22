'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// global-error replaces the root layout when it throws, so it must
// render its own <html> and <body>.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#1b1b1e',
          color: '#e8e6df',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <p
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#8a8a92',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 8,
            }}
          >
            Something went wrong
          </p>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 12,
              color: '#e8e6df',
            }}
          >
            An error occurred
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#8a8a92',
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            We hit an unexpected error loading the page. Your work is safe — try
            refreshing or go back to the dashboard.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                background: '#c8f135',
                color: '#0d0f14',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/dashboard"
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: '1px solid #2e2e34',
                color: '#e8e6df',
                fontSize: 14,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Go to dashboard
            </a>
          </div>

          {error.digest && (
            <p
              style={{
                marginTop: 24,
                fontSize: 10,
                fontFamily: 'monospace',
                color: '#48484f',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
