import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'resmd',
    template: '%s | resmd',
  },
  description:
    'Write your resume in plain text. Render it through beautiful templates. Manage multiple tailored variants. Export to PDF.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://resmd.co'),
  openGraph: {
    type: 'website',
    siteName: 'resmd',
    title: 'resmd — Plain text resume builder',
    description:
      'Write your resume in plain text. Render it through beautiful templates.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'resmd — Plain text resume builder',
    description:
      'Write your resume in plain text. Render it through beautiful templates.',
  },
  verification: {
    google: 'SsI2pfnMSYm-weeLeIBh8w1sDREtxbKXQmIYO7uN_r4',
  },
};

/**
 * Inline script that runs before first paint to apply the stored theme mode.
 * This prevents the flash-of-wrong-theme (FOWT) on page load.
 * Dark is the default (no class needed). Light mode adds the `.light` class.
 * CSS vars in globals.css handle the inkglow dark palette for SSR.
 * Non-default themes are handled client-side by applyTheme() after hydration.
 */
const themeInitScript = `
(function() {
  try {
    var mode = localStorage.getItem('resmd_theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Light mode is opt-in — add .light class only when explicitly chosen or system prefers light
    if (mode === 'light' || (!mode && !prefersDark)) {
      document.documentElement.classList.add('light');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme init must run before body renders to prevent FOWT */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
