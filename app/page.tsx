'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  HeartIcon,
  TerminalIcon,
  ArrowDownIcon,
  StarIcon,
  CheckIcon,
  EyeIcon,
  FileTextIcon,
  GitBranchIcon,
  SparkleIcon,
  PaletteIcon,
  CoffeeIcon,
  SunIcon,
  MoonIcon,
} from '@phosphor-icons/react';
import { applyTheme, getStoredThemePrefs } from '@/lib/themes';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-bg text-text font-ui overflow-x-hidden">
      <div className="bg-dot-grid fixed inset-0 pointer-events-none" />
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <Support />
      <Footer />
    </div>
  );
}

/* ─── Nav ─────────────────────────────────────────────────────────────────── */

function Nav() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const { themeId, mode } = getStoredThemePrefs();
    applyTheme(themeId, mode);
    setIsDark(mode === 'dark');
  }, []);

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    const { themeId } = getStoredThemePrefs();
    applyTheme(themeId, newMode);
    setIsDark(!isDark);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-bg/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-display text-xl tracking-tight text-text">
          res<span className="text-accent">md</span>
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted hover:text-text hover:bg-surface-2 transition-colors duration-150"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
          <a
            href="https://buymeacoffee.com/hattahiroo"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-sm text-muted hover:text-text transition-colors duration-200"
          >
            <HeartIcon className="w-4 h-4" />
            Support
          </a>
          <Link
            href="/auth"
            className="text-sm text-muted hover:text-text transition-colors duration-200"
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className="text-sm font-medium bg-accent hover:bg-accent-hover text-accent-text px-5 py-2 rounded-lg transition-all duration-200 hover:shadow-accent hover:shadow-lg"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 min-h-[90vh] flex items-center">
      {/* Decorative floating shapes */}
      <div className="absolute top-40 left-10 w-32 h-32 border border-accent/20 rounded-full animate-float hidden lg:block" />
      <div className="absolute top-60 right-20 w-20 h-20 bg-secondary/10 rounded-lg rotate-12 animate-float-reverse hidden lg:block" />
      <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-accent rounded-full animate-pulse hidden lg:block" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left content - asymmetric positioning */}
          <div className="lg:col-span-7 lg:pr-12">
            <div className="reveal-up">
              <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-xs font-medium text-muted">
                  ResMarkup 1.0 is here
                </span>
              </div>
            </div>

            <h1 className="reveal-up reveal-delay-1 font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-text mb-6">
              Write resumes{' '}
              <span className="text-gradient-shimmer">like code.</span>
              <br />
              <span className="text-muted text-4xl sm:text-5xl lg:text-6xl">
                Ship like a pro.
              </span>
            </h1>

            <p className="reveal-up reveal-delay-2 text-lg text-muted leading-relaxed mb-8 max-w-lg">
              Plain text syntax. Live preview. AI-powered polishing. Create
              multiple variants for every opportunity — all from one source of
              truth.
            </p>

            <div className="reveal-up reveal-delay-3 flex flex-wrap gap-4 mb-8">
              <Link
                href="/auth"
                className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-text font-medium px-7 py-3.5 rounded-xl transition-all duration-300 hover:shadow-accent hover:shadow-xl hover:-translate-y-1"
              >
                <TerminalIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Start for free
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-border hover:border-accent/50 text-muted hover:text-text px-7 py-3.5 rounded-xl transition-all duration-200 hover:bg-surface"
              >
                <ArrowDownIcon className="w-4 h-4" />
                See how it works
              </a>
            </div>

            <p className="reveal-up reveal-delay-4 text-xs text-faint flex items-center gap-2">
              <CheckIcon className="w-3 h-3 text-accent" />
              Free · No credit card · No watermarks
            </p>
          </div>

          {/* Right side - Editor + preview mockup with asymmetric layout */}
          <div className="lg:col-span-5 relative">
            <div className="reveal-up reveal-delay-2 relative">
              {/* Floating accent behind */}
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 via-secondary/10 to-transparent rounded-3xl blur-2xl" />

              <div className="relative grid grid-cols-2 gap-3">
                <EditorMockup />
                <PreviewMockup />
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 glass-card rounded-xl px-5 py-4 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <StarIcon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-text">5 min</div>
                    <div className="text-xs text-faint">to first resume</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EditorMockup() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-surface-2">
        <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
        <span className="ml-2 text-[10px] text-faint font-mono">
          resume.resmd
        </span>
      </div>
      {/* Code */}
      <pre className="p-4 text-[9px] leading-5 font-mono overflow-hidden">
        <CodeLine type="section"># Bio</CodeLine>
        <CodeLine type="kv">Name: Alex Rivera</CodeLine>
        <CodeLine type="kv">Title: Senior Engineer</CodeLine>
        <CodeLine type="kv">Email: alex@email.com</CodeLine>
        <br />
        <CodeLine type="section"># Experience</CodeLine>
        <CodeLine type="entry">## Staff @ Stripe</CodeLine>
        <CodeLine type="bullet">• Led 1B+ txns</CodeLine>
        <CodeLine type="bullet">• -38% latency</CodeLine>
      </pre>
    </div>
  );
}

function PreviewMockup() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500 mt-8">
      <div className="p-4 text-[#1A1C23]">
        <div className="border-b border-gray-200 pb-3 mb-3">
          <h2 className="text-base font-bold font-display text-[#1A1C23]">
            Alex Rivera
          </h2>
          <p className="text-[10px] text-gray-500">Senior Engineer</p>
        </div>
        <div className="mb-3">
          <h3 className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            Experience
          </h3>
          <div className="mb-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] font-semibold text-[#1A1C23]">
                Staff Engineer
              </span>
              <span className="text-[8px] text-gray-400">2022–Now</span>
            </div>
            <span className="text-[9px] text-gray-500">Stripe</span>
            <ul className="mt-1 space-y-0.5">
              <li className="text-[9px] text-gray-600 flex gap-1">
                <span>•</span>Led 1B+ transactions
              </li>
            </ul>
          </div>
        </div>
        <div>
          <h3 className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            Skills
          </h3>
          <div className="flex flex-wrap gap-1">
            <span className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded">
              TypeScript
            </span>
            <span className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded">
              Go
            </span>
            <span className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded">
              Rust
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeLine({
  type,
  children,
}: {
  type: 'section' | 'entry' | 'kv' | 'bullet';
  children: React.ReactNode;
}) {
  const color =
    type === 'section'
      ? 'text-accent font-bold'
      : type === 'entry'
        ? 'text-text font-semibold'
        : type === 'kv'
          ? 'text-secondary'
          : 'text-muted';
  return <div className={color}>{children}</div>;
}

/* ─── How It Works ───────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Write in plain text',
      body: 'Use ResMarkup syntax — sections, entries, key-value pairs. No forms, no drag-drop. Just you and your keyboard.',
      code: '# Experience\n## Engineer @ Stripe\n• Built payment infra',
      icon: <TerminalIcon className="w-5 h-5" />,
    },
    {
      n: '02',
      title: 'Watch it live',
      body: 'Every keystroke updates the preview instantly. Switch templates in one click — same content, fresh look.',
      icon: <EyeIcon className="w-5 h-5" />,
    },
    {
      n: '03',
      title: 'Branch & tailor',
      body: 'Clone variants for each application. Keep your "master" clean while customizing for specific roles.',
      icon: <GitBranchIcon className="w-5 h-5" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-28 px-6 relative">
      {/* Background accent line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent hidden lg:block" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="reveal-up font-display text-4xl sm:text-5xl text-text mb-4">
            No wizards. <span className="text-accent">No bloat.</span>
          </h2>
          <p className="reveal-up reveal-delay-1 text-muted text-lg max-w-md mx-auto">
            Three steps. Zero onboarding. Just write.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className="reveal-up reveal-delay-2 group relative"
            >
              {/* Connecting line for desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-accent/30 to-transparent -z-10" />
              )}

              <div className="glass-card rounded-2xl p-6 h-full card-lift glow-border-accent">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-display text-accent/30 font-bold">
                    {step.n}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-text transition-colors">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-text mb-3">
                  {step.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-4">
                  {step.body}
                </p>
                {step.code && (
                  <pre className="text-[10px] font-mono text-secondary bg-surface-2 rounded-lg p-3 leading-4 whitespace-pre-wrap border-l-2 border-accent/30">
                    {step.code}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────────────────────────── */

function Features() {
  const features = [
    {
      icon: <FileTextIcon />,
      label: 'ResMarkup',
      title: 'Plain text you own',
      body: 'No proprietary format. ResMarkup is readable text you could write anywhere. The platform makes it beautiful.',
      accent: 'accent',
    },
    {
      icon: <GitBranchIcon />,
      label: 'Variants',
      title: 'One base, many doors',
      body: 'Clone any variant to tailor for roles. Engineering CV, management track, freelance pitch — branched, not duplicated.',
      accent: 'secondary',
    },
    {
      icon: <SparkleIcon />,
      label: 'AI',
      title: 'Enhance, never replace',
      body: 'Bullet optimizer, section reviewer, job match scorer. Every AI suggestion shown as diff — you decide what stays.',
      accent: 'secondary',
    },
    {
      icon: <PaletteIcon />,
      label: 'Templates',
      title: 'Swap skin instantly',
      body: 'Minimal, Modern, Technical, Executive, Creative. Switch templates in one click — content adapts automatically.',
      accent: 'accent',
    },
  ];

  return (
    <section className="py-28 px-6 bg-surface/30 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="reveal-up font-display text-4xl sm:text-5xl text-text mb-4">
              Built <span className="text-gradient-shimmer">different</span>
            </h2>
            <p className="reveal-up reveal-delay-1 text-muted text-lg max-w-md">
              Most resume builders are fancy form editors. resmd is a writing
              tool with publication-quality output.
            </p>
          </div>
          <div className="reveal-up reveal-delay-2 flex gap-3">
            <div className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted">
              ← Scroll to explore
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`reveal-up reveal-delay-${i + 1} group relative bg-surface border border-border rounded-2xl p-6 hover:-translate-y-2 transition-all duration-300 ${f.accent === 'accent' ? 'hover:border-accent/50' : 'hover:border-secondary/50'}`}
            >
              <div
                className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity ${f.accent === 'accent' ? 'bg-accent/5' : 'bg-secondary/5'}`}
              />
              <div
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${f.accent === 'accent' ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary'}`}
              >
                {f.icon}
              </div>
              <div
                className={`relative text-xs font-medium mb-2 ${f.accent === 'accent' ? 'text-accent' : 'text-secondary'}`}
              >
                {f.label}
              </div>
              <h3 className="relative text-lg font-semibold text-text mb-2">
                {f.title}
              </h3>
              <p className="relative text-sm text-muted leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Support ────────────────────────────────────────────────────────────── */

function Support() {
  return (
    <section className="py-28 px-6 relative" id="support">
      <div className="max-w-3xl mx-auto text-center">
        <div className="reveal-up relative inline-flex">
          <div className="absolute inset-0 bg-accent/20 blur-3xl" />
          <div className="relative w-24 h-24 bg-surface border border-accent/30 rounded-3xl flex items-center justify-center mx-auto mb-8 text-accent">
            <CoffeeIcon size={40} />
          </div>
        </div>

        <h2 className="reveal-up reveal-delay-1 font-display text-4xl sm:text-5xl text-text mb-6">
          Free. <span className="text-muted">Really.</span>
        </h2>

        <p className="reveal-up reveal-delay-2 text-muted text-lg leading-relaxed mb-10 max-w-lg mx-auto">
          No credit card. No paywalls. No gotchas — for now. If resmd helped you
          land something good, a coffee keeps it running.
        </p>

        <div className="reveal-up reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://buymeacoffee.com/hattahiroo"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent-hover text-accent-text text-base font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          >
            <CoffeeIcon size={20} />
            Buy me a coffee
            <span className="opacity-50">·</span>
            <span className="text-sm font-normal">$$</span>
          </a>
        </div>

        <p className="reveal-up reveal-delay-4 text-xs text-faint mt-6">
          Every cup helps keep resmd free and actively maintained!
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 px-6 bg-surface/50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start">
          <span className="font-display text-xl text-text">
            res<span className="text-accent">md</span>
          </span>
          <p className="text-xs text-faint mt-1">Plain text resume builder</p>
        </div>
        <div className="flex items-center gap-8 text-sm text-muted">
          <Link href="/auth" className="hover:text-text transition-colors">
            Sign in
          </Link>
          <Link href="/privacy" className="hover:text-text transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text transition-colors">
            Terms
          </Link>
          <a
            href="https://buymeacoffee.com/hattahiroo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors flex items-center gap-1"
          >
            <HeartIcon className="w-4 h-4" />
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
