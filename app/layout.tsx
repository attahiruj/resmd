import type { Metadata } from 'next';
import { Noto_Sans, Noto_Sans_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const notoSansMono = Noto_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-noto-sans-mono',
  weight: ['400', '700'],
  display: 'swap',
});

const courierPrime = localFont({
  src: [
    {
      path: '../public/fonts/CourierPrime-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/CourierPrime-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/CourierPrime-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/CourierPrime-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-courier-prime',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'resmd',
    template: '%s | resmd',
  },
  description:
    'Write your resume in plain text. Render it through beautiful templates. Manage multiple tailored variants. Export to PDF.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://resmd.app'),
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
    <html
      lang="en"
      className={`${notoSans.variable} ${notoSansMono.variable} ${courierPrime.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme init must run before body renders to prevent FOWT */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
