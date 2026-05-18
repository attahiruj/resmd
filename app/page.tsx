'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowRightIcon,
  CheckIcon,
  GithubLogoIcon,
  SparkleIcon,
} from '@phosphor-icons/react';
import { applyTheme, getStoredThemePrefs } from '@/lib/themes';

const HomeBelowFold = dynamic(() => import('@/components/home/HomeBelowFold'), {
  loading: () => <div className="min-h-[200px]" />,
});

export default function Home() {
  useEffect(() => {
    const { themeId, mode } = getStoredThemePrefs();
    applyTheme(themeId, mode);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text font-ui overflow-x-hidden">
      <div className="bg-dot-grid fixed inset-0 pointer-events-none" />
      <Nav />
      <main>
        <Hero />
        <HomeBelowFold />
      </main>
    </div>
  );
}

/* ─── Floating Pill Nav ──────────────────────────────────────────────────── */

function Nav() {
  return (
    <header className="fixed top-5 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <nav className="pointer-events-auto inline-flex items-center gap-5 px-5 py-2.5 bg-bg/90 border border-border rounded-full backdrop-blur-xl shadow-lg">
        <span className="font-display text-base font-bold text-text tracking-tight select-none">
          res<span className="text-accent">md</span>
        </span>
        <div className="w-px h-3.5 bg-border flex-shrink-0" />
        <div className="hidden sm:flex items-center gap-5">
          <a
            href="#features"
            className="text-sm text-muted hover:text-text transition-colors"
          >
            Features
          </a>
          <a
            href="https://github.com/attahiruj/resmd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-text transition-colors"
          >
            GitHub
          </a>
        </div>
        <div className="w-px h-3.5 bg-border flex-shrink-0 hidden sm:block" />
        <Link
          href="/auth"
          className="text-sm text-muted hover:text-text transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/editor/new"
          className="text-sm font-bold bg-accent hover:bg-accent-hover text-accent-text px-4 py-1.5 rounded-full transition-all duration-200 hover:shadow-accent hover:shadow-md flex items-center gap-1.5"
        >
          Start free
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </nav>
    </header>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 px-6 flex flex-col items-center overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)',
          opacity: 0.35,
        }}
      />
      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '500px',
          background:
            'radial-gradient(ellipse, rgba(var(--accent-rgb, 200 242 48) / 0.07) 0%, transparent 70%)',
        }}
      />

      {/* Badge */}
      <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/25 bg-accent/8 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 animate-pulse" />
        <span className="text-[11px] font-medium text-accent tracking-wide">
          Plain text → polished resume
        </span>
      </div>

      {/* Headline */}
      <h1
        className="relative z-10 text-center font-display font-bold leading-none tracking-tighter mb-6"
        style={{ fontSize: 'clamp(52px, 8vw, 88px)', letterSpacing: '-3px' }}
      >
        Write resumes
        <br />
        <span className="text-accent">like code.</span>
        <br />
        <span className="text-muted" style={{ fontSize: '0.85em' }}>
          Stand out. Get hired.
        </span>
      </h1>

      <p className="relative z-10 text-center text-muted text-lg leading-relaxed mb-9 max-w-md">
        Plain text syntax. Live preview. AI polishing. Multiple variants from
        one source of truth.
      </p>

      {/* CTAs */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-3 mb-4">
        <Link
          href="/editor/new"
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-accent-text font-bold px-6 py-3 rounded-full transition-all duration-200 hover:shadow-accent hover:shadow-lg hover:-translate-y-0.5 text-[15px]"
        >
          <ArrowRightIcon className="w-4 h-4" weight="bold" />
          Try it free
        </Link>
        <a
          href="#how-it-works"
          className="inline-flex items-center justify-center gap-2 border border-border hover:border-muted/50 text-muted hover:text-text px-6 py-3 rounded-full transition-all duration-200 hover:bg-surface text-[13.5px]"
        >
          See how it works
          <ArrowRightIcon className="w-3.5 h-3.5 rotate-90" />
        </a>
      </div>

      <p className="relative z-10 flex items-center gap-1.5 text-xs text-faint mb-12">
        <CheckIcon className="w-3 h-3 text-accent" weight="bold" />
        Free
        <span className="mx-1 opacity-40">·</span>
        No credit card
        <span className="mx-1 opacity-40">·</span>
        No watermarks
      </p>

      {/* Editor Demo */}
      <div className="relative z-10 w-full max-w-[960px]">
        <HeroDemo />
      </div>
      <div className="absolute top-4 right-4 hidden sm:flex bg-surface border border-border rounded-lg p-2 items-center gap-2 text-xs text-muted">
        <GithubLogoIcon className="w-3 h-3" />
        <span className="font-medium">GitHub</span>
      </div>
    </section>
  );
}

const EDITOR_LINES = [
  { text: '# Bio', cls: 'text-accent font-bold' },
  { text: 'Name: Alex Rivera', cls: 'text-muted pl-4' },
  { text: 'Title: Staff Engineer', cls: 'text-muted pl-4' },
  { text: 'Email: alex@stripe.com', cls: 'text-secondary pl-4' },
  { text: '', cls: '' },
  { text: '## Relevant Experience', cls: 'text-secondary font-semibold' },
  { text: '### Staff Eng @ Stripe | 2022–Now', cls: 'text-text pl-4' },
  { text: '- Led 6-person infra team', cls: 'text-muted pl-8' },
  { text: '- Built payments SDK', cls: 'text-muted pl-8' },
  { text: '- −38% API latency', cls: 'text-muted pl-8' },
  { text: '', cls: '' },
  { text: '## Skills', cls: 'text-secondary font-semibold' },
  { text: '- TypeScript, Go, Rust, Python', cls: 'text-muted pl-4' },
  { text: '- Kubernetes, AWS, Terraform', cls: 'text-muted pl-4' },
];

function HeroDemo() {
  const [lines, setLines] = useState<typeof EDITOR_LINES>([]);
  const [showPreview, setShowPreview] = useState(false);
  const lineIdx = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function next() {
      if (done.current) return;
      const i = lineIdx.current;
      if (i >= EDITOR_LINES.length) {
        done.current = true;
        setTimeout(() => setShowPreview(true), 300);
        return;
      }
      lineIdx.current = i + 1;
      setLines((prev) => [...prev, EDITOR_LINES[i]]);
      timer = setTimeout(next, EDITOR_LINES[i].text === '' ? 60 : 120);
    }

    timer = setTimeout(next, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden border border-border shadow-2xl"
      style={{
        boxShadow:
          '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)',
      }}
    >
      {/* Chrome bar */}
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#070707] border-b border-border">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[11px] text-faint font-mono flex-1">
          resume.md — Alex Rivera
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-accent/30 text-[11px] text-accent font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Live
        </span>
      </div>

      {/* Split body */}
      <div className="flex">
        {/* Editor */}
        <div className="flex-[0_0_46%] bg-[#070707] p-5 border-r border-border font-mono text-[12px] leading-[1.75] min-h-[360px]">
          {lines.map((line, i) =>
            line.text === '' ? (
              <div key={i} className="h-3" />
            ) : (
              <div key={i} className={line.cls}>
                {line.text}
              </div>
            )
          )}
          {!done.current && (
            <span
              className="inline-block w-0.5 h-3.5 bg-accent align-middle"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
          )}
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
          {done.current && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded border border-accent/20 bg-accent/10 text-accent text-[10px]">
              <SparkleIcon className="w-3 h-3" />
              Ask AI · improve bullets
            </div>
          )}
        </div>

        {/* Preview */}
        <div
          className="flex-1 bg-[#f7f6f1] p-6 min-h-[360px] transition-opacity duration-500"
          style={{ opacity: showPreview ? 1 : 0 }}
        >
          <div className="font-serif text-[19px] font-bold text-[#111] mb-0.5">
            Alex Rivera
          </div>
          <div className="text-[11px] text-gray-500 mb-3">
            alex@stripe.com · GitHub · San Francisco, CA
          </div>
          <hr className="border-gray-200 mb-2.5" />
          <div className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-2">
            Relevant Experience
          </div>
          <div className="text-[12px] font-bold text-[#222]">
            Staff Engineer
          </div>
          <div className="text-[10px] text-gray-400 mb-1">
            Stripe · 2022–Now
          </div>
          {[
            'Led 6-person infra team',
            'Built payments SDK used by 40k+ merchants',
            'Reduced API latency 38%',
          ].map((b) => (
            <div
              key={b}
              className="text-[10.5px] text-gray-600 pl-3 relative leading-[1.5]"
            >
              <span className="absolute left-1 text-gray-400">·</span>
              {b}
            </div>
          ))}
          <hr className="border-gray-200 my-2.5" />
          <div className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-2">
            Skills
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['TypeScript', 'Go', 'Rust', 'Python', 'Kubernetes'].map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 bg-gray-100 rounded text-gray-500"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
