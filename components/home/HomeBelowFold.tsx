'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  TerminalIcon,
  EyeIcon,
  GitBranchIcon,
  SparkleIcon,
  PaletteIcon,
  FileTextIcon,
  CoffeeIcon,
  HeartIcon,
  GithubLogoIcon,
  PencilSimpleIcon,
  MagicWandIcon,
  ArrowRightIcon,
} from '@phosphor-icons/react';

/* ─── How It Works ───────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      n: '01',
      icon: <TerminalIcon className="w-5 h-5" />,
      title: 'Write in plain text',
      body: 'ResMarkup syntax — sections, entries, key-value pairs. No forms, no drag-drop. Just you and your keyboard.',
    },
    {
      n: '02',
      icon: <EyeIcon className="w-5 h-5" />,
      title: 'Watch it live',
      body: 'Every keystroke updates the preview instantly. Switch templates in one click — same content, fresh look.',
    },
    {
      n: '03',
      icon: <GitBranchIcon className="w-5 h-5" />,
      title: 'Branch & tailor',
      body: 'Clone for each application. Keep your master clean while customizing bullets for specific roles.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="reveal-up font-display text-4xl sm:text-5xl font-bold tracking-tight text-text mb-3">
            No wizards. <span className="text-accent">No bloat.</span>
          </h2>
          <p className="reveal-up reveal-delay-1 text-muted text-base">
            Three steps. Zero onboarding. Just write.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className="reveal-up group p-8 border-t-2 border-border hover:border-accent transition-colors cursor-default border-r border-r-border last:border-r-0 max-md:border-r-0 max-md:border-b max-md:last:border-b-0"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="block font-mono text-[44px] font-bold text-muted group-hover:text-accent transition-colors leading-none mb-5 tracking-tighter">
                {step.n}
              </span>
              <span className="block text-muted mb-3.5">{step.icon}</span>
              <h3 className="text-[17px] font-semibold text-text mb-2.5 tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Demo Walkthrough ───────────────────────────────────────────────────── */

const WALKTHROUGH_STEPS = [
  {
    num: '01',
    title: 'Type your content',
    desc: 'Start with # Bio and fill in your details. ResMarkup reads like plain English.',
    icon: <PencilSimpleIcon className="w-4 h-4" />,
    screenTitle: 'resume.md — editing',
  },
  {
    num: '02',
    title: 'Live preview updates',
    desc: 'The right pane renders beautifully as you type. No compile step, no refresh.',
    icon: <EyeIcon className="w-4 h-4" />,
    screenTitle: 'resume.md — preview sync',
  },
  {
    num: '03',
    title: 'Polish with AI',
    desc: 'Highlight any bullet. Ask AI to improve it. Review the diff and accept or reject.',
    icon: <MagicWandIcon className="w-4 h-4" />,
    screenTitle: 'resume.md — AI polish',
  },
  {
    num: '04',
    title: 'Branch for each role',
    desc: 'Fork the file, tune bullets for the job description, export clean PDF.',
    icon: <GitBranchIcon className="w-4 h-4" />,
    screenTitle: 'resume.md — branching',
  },
];

function DemoScreen({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="flex min-h-[300px]">
        <div className="flex-[0_0_52%] bg-[#070707] p-4 font-mono text-[11.5px] leading-[1.7] border-r border-border">
          <div className="text-accent"># Bio</div>
          <div className="text-muted pl-3">Name: Alex Rivera</div>
          <div className="text-muted pl-3">Title: Staff Engineer</div>
          <div className="text-secondary pl-3">Email: alex@stripe.com</div>
          <div className="h-3" />
          <div className="text-secondary">## Experience</div>
          <div className="text-text pl-3">### Staff @ Stripe | 2022–Now</div>
          <div className="text-muted pl-6">
            - Led 6-person team
            <span
              className="inline-block w-0.5 h-3 bg-accent align-middle ml-0.5"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
          </div>
        </div>
        <div className="flex-1 bg-[#f7f6f1] p-5">
          <div className="font-serif text-[16px] font-bold text-[#111]">
            Alex Rivera
          </div>
          <div className="text-[10px] text-gray-500 mb-2.5">
            alex@stripe.com · San Francisco
          </div>
          <hr className="border-gray-200 mb-2" />
          <div className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            Experience
          </div>
          <div className="text-[11px] font-bold text-[#222]">
            Staff Engineer
          </div>
          <div className="text-[10px] text-gray-400 mb-1">
            Stripe · 2022–Now
          </div>
          <div className="text-[10px] text-gray-600 pl-2 relative">
            <span className="absolute left-0 text-gray-300">·</span>Led 6-person
            team
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex min-h-[300px]">
        <div className="flex-[0_0_52%] bg-[#070707] p-4 font-mono text-[11.5px] leading-[1.7] border-r border-border">
          <div className="text-accent"># Bio</div>
          <div className="text-muted pl-3">Name: Alex Rivera</div>
          <div className="h-3" />
          <div className="text-secondary">## Experience</div>
          <div className="text-text pl-3">### Staff @ Stripe | 2022–Now</div>
          <div className="text-muted pl-6">- Led 6-person team</div>
          <div className="text-muted pl-6">- Built payments SDK</div>
          <div className="text-muted pl-6">- −38% API latency</div>
        </div>
        <div className="flex-1 bg-[#f7f6f1] p-5">
          <div className="font-serif text-[16px] font-bold text-[#111]">
            Alex Rivera
          </div>
          <hr className="border-gray-200 my-2" />
          <div className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            Experience
          </div>
          <div className="text-[11px] font-bold text-[#222]">
            Staff Engineer
          </div>
          <div className="text-[10px] text-gray-400 mb-1">
            Stripe · 2022–Now
          </div>
          {['Led 6-person team', 'Built payments SDK', '−38% API latency'].map(
            (b) => (
              <div key={b} className="text-[10px] text-gray-600 pl-2 relative">
                <span className="absolute left-0 text-gray-300">·</span>
                {b}
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="bg-[#0a0a0a] p-5 min-h-[300px]">
        <div className="text-xs text-muted font-mono mb-4 flex items-center gap-2">
          <SparkleIcon className="w-3.5 h-3.5 text-accent" />
          AI · Bullet optimizer
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 mb-3">
          <div className="text-[11px] text-faint font-mono mb-2">Original</div>
          <div className="text-[13px] text-muted line-through opacity-50">
            - Led 6-person team
          </div>
        </div>
        <div className="flex justify-center text-accent text-lg my-2">
          <ArrowRightIcon className="w-4 h-4 rotate-90" />
        </div>
        <div className="bg-accent/6 border border-accent/20 rounded-lg p-4">
          <div className="text-[11px] text-accent font-mono mb-2">
            AI Suggestion
          </div>
          <div className="text-[13px] text-text leading-relaxed">
            - Scaled infrastructure for a 6-engineer team, delivering 3 major
            platform launches on schedule
          </div>
          <div className="flex gap-2 mt-3">
            <button className="px-3.5 py-1.5 bg-accent text-accent-text text-[12px] font-bold rounded cursor-pointer">
              Accept
            </button>
            <button className="px-3.5 py-1.5 border border-border text-muted text-[12px] rounded cursor-pointer">
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#070707] p-5 font-mono text-[12px] min-h-[300px]">
      <div className="text-muted text-[11px] mb-4">Branches</div>
      <div className="flex flex-col gap-2">
        <div className="bg-surface border border-accent rounded-lg p-3.5 flex items-center gap-3">
          <GitBranchIcon className="w-4 h-4 text-accent" />
          <div>
            <div className="text-text text-[13px]">master</div>
            <div className="text-faint text-[11px]">source of truth</div>
          </div>
          <span className="ml-auto bg-accent/12 text-accent px-2 py-0.5 rounded text-[10px]">
            active
          </span>
        </div>
        {[
          { name: 'stripe-staff-eng', desc: 'tailored for Stripe role' },
          { name: 'anthropic-ml-eng', desc: 'ML focus, technical depth' },
        ].map((b) => (
          <div
            key={b.name}
            className="bg-surface-2 border border-border rounded-lg p-3.5 flex items-center gap-3"
          >
            <GitBranchIcon className="w-4 h-4 text-muted" />
            <div>
              <div className="text-muted text-[13px]">{b.name}</div>
              <div className="text-faint text-[11px]">{b.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoWalkthrough() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-24 px-6 border-t border-border bg-gradient-to-b from-bg to-surface/30">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16 reveal-up">
          <span className="text-[11px] font-semibold tracking-widest text-accent uppercase mb-3.5 block">
            Walkthrough
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-text mb-3">
            See the workflow <span className="text-accent">in action</span>
          </h2>
          <p className="text-muted text-base mt-2">
            From blank file to submission-ready resume in under three minutes.
          </p>
        </div>

        <div className="reveal-up grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-start">
          <div className="flex flex-col gap-1">
            {WALKTHROUGH_STEPS.map((step, i) => (
              <button
                key={step.num}
                onClick={() => setActive(i)}
                className={`text-left p-5 rounded-lg border transition-all ${
                  active === i
                    ? 'bg-surface-2 border-border relative'
                    : 'border-transparent hover:bg-surface/50'
                }`}
              >
                {active === i && (
                  <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-accent rounded-r" />
                )}
                <div className="text-[11px] font-mono text-faint mb-1">
                  {step.num} /
                </div>
                <div
                  className={`text-[14px] font-semibold flex items-center gap-2 ${
                    active === i ? 'text-text' : 'text-muted'
                  }`}
                >
                  {step.icon}
                  {step.title}
                </div>
                {active === i && (
                  <div className="text-[12.5px] text-muted leading-relaxed mt-1.5">
                    {step.desc}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden border border-border shadow-2xl">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#070707] border-b border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2.5 font-mono text-[11px] text-faint">
                {WALKTHROUGH_STEPS[active].screenTitle}
              </span>
            </div>
            <DemoScreen step={active} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────────────────────────── */

function Features() {
  const features = [
    {
      tag: 'ResMarkup',
      title: 'Plain text you own',
      body: 'No proprietary format. ResMarkup is readable text you could write anywhere. The platform makes it beautiful.',
      tagColor: 'text-accent',
      icon: <FileTextIcon className="w-7 h-7" />,
    },
    {
      tag: 'Variants',
      title: 'One base, many doors',
      body: 'Clone any variant to tailor for roles — Engineering CV, management track, freelance pitch. Branched, not duplicated.',
      tagColor: 'text-secondary',
      icon: <GitBranchIcon className="w-7 h-7" />,
    },
    {
      tag: 'AI',
      title: 'Enhance, never replace',
      body: 'Bullet optimizer, section reviewer, job match scorer. Every AI suggestion shown as a diff — you decide what stays.',
      tagColor: 'text-[#7dd3a8]',
      icon: <SparkleIcon className="w-7 h-7" />,
    },
    {
      tag: 'Templates',
      title: 'Swap skin instantly',
      body: 'Minimal. Modern. Technical. Executive. Creative. Switch templates in one click — content adapts automatically.',
      tagColor: 'text-[#f5a623]',
      icon: <PaletteIcon className="w-7 h-7" />,
    },
  ];

  return (
    <section id="features" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <h2 className="reveal-up font-display text-4xl sm:text-5xl font-bold tracking-tight text-text mb-3">
            Built <span className="text-accent">different.</span>
          </h2>
          <p className="reveal-up reveal-delay-1 text-muted text-base max-w-md leading-relaxed">
            Most resume builders are fancy form editors. resmd is a writing tool
            with publication-quality output.
          </p>
        </div>

        <div className="reveal-up grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-bg p-9 relative overflow-hidden group transition-colors hover:bg-surface/40"
            >
              <div className="absolute right-8 top-9 opacity-[0.08] text-text">
                {f.icon}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-wide mb-3.5 block ${f.tagColor}`}
              >
                {f.tag}
              </span>
              <h3 className="text-[20px] font-bold text-text tracking-tight mb-2.5">
                {f.title}
              </h3>
              <p className="text-[14px] text-muted leading-relaxed max-w-[360px]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────────────────── */

function Testimonials() {
  const cards = [
    {
      quote: (
        <>
          Finally a resume tool that doesn&apos;t get in the way.{' '}
          <strong className="text-text font-medium">
            I write in vscode, paste into resmd, done.
          </strong>{' '}
          The preview is instant and the PDF output is stunning.
        </>
      ),
      initials: 'MA',
      name: 'Mustapha A.',
      role: 'Data Scientist',
    },
    {
      quote: (
        <>
          The branching feature is a game-changer.{' '}
          <strong className="text-text font-medium">
            I have one master resume and 12 role-specific variants
          </strong>
          , all kept in sync. No more copy-paste hell.
        </>
      ),
      initials: 'JF',
      name: 'Joseph F.',
      role: 'Software Engineer',
    },
    {
      quote: (
        <>
          The AI bullet optimizer is the only AI resume tool that{' '}
          <strong className="text-text font-medium">
            doesn&apos;t make everything sound like it was written by a robot
          </strong>
          . It suggests; you decide.
        </>
      ),
      initials: 'MJ',
      name: 'Attahiru J.',
      role: 'Robotics Engineer',
    },
  ];

  return (
    <section className="py-24 px-6 border-t border-border overflow-hidden">
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center mb-15 reveal-up">
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-text mb-0">
            Built for people who{' '}
            <span className="text-accent">think in text</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14">
          {cards.map((c, i) => (
            <div
              key={c.name}
              className="reveal-up bg-surface border border-border rounded-xl p-7 hover:-translate-y-0.5 transition-transform"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <p className="text-[14.5px] text-muted leading-[1.7] mb-5">
                {c.quote}
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center font-mono text-[12px] font-bold text-faint flex-shrink-0">
                  {c.initials}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-text">
                    {c.name}
                  </div>
                  <div className="text-[12px] text-faint">{c.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer CTA + Footer ────────────────────────────────────────────────── */

function FooterCTA() {
  return (
    <>
      <section className="py-28 px-6 border-t border-border text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 800px 500px at 50% 40%, rgba(var(--accent-rgb, 200 242 48) / 0.06) 0%, transparent 65%)',
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <p className="reveal-up text-[12px] font-semibold tracking-widest text-accent uppercase mb-5">
            Free. No catches.
          </p>
          <h2
            className="reveal-up font-display font-bold tracking-tighter leading-none mb-7"
            style={{
              fontSize: 'clamp(48px, 6vw, 80px)',
              letterSpacing: '-3px',
            }}
          >
            Free.
            <br />
            <span className="text-accent">Really.</span>
          </h2>
          <p className="reveal-up text-muted text-base mb-10">
            No credit card. No paywalls. No gotchas.
          </p>
          <div className="reveal-up flex flex-wrap gap-3 justify-center items-center">
            <Link
              href="/editor/new"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-text font-bold px-7 py-3.5 rounded-full text-[15px] transition-all duration-200 hover:shadow-accent hover:shadow-lg hover:-translate-y-0.5"
            >
              <ArrowRightIcon className="w-4 h-4" weight="bold" />
              Start free
            </Link>
            <a
              href="https://github.com/attahiruj/resmd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border hover:border-muted/40 text-muted hover:text-text px-6 py-3.5 rounded-full text-[14px] transition-all duration-200 hover:bg-surface"
            >
              <GithubLogoIcon className="w-4 h-4" />
              Star on GitHub
            </a>
            <a
              href="https://buymeacoffee.com/hattahiroo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border hover:border-muted/40 text-muted hover:text-text px-6 py-3.5 rounded-full text-[14px] transition-all duration-200 hover:bg-surface"
            >
              <CoffeeIcon className="w-4 h-4" />
              Buy me a coffee
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-9 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-display text-[15px] font-bold text-text">
              res<span className="text-accent">md</span>
            </div>
            <div className="text-[12px] text-faint mt-0.5">
              Plain text resume builder
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-2 text-[13px] text-faint">
            <Link href="/auth" className="hover:text-text transition-colors">
              Sign in
            </Link>
            <Link href="/help" className="hover:text-text transition-colors">
              Help
            </Link>
            <Link href="/privacy" className="hover:text-text transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-text transition-colors">
              Terms
            </Link>
            <a
              href="https://github.com/attahiruj/resmd"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors flex items-center gap-1"
            >
              <GithubLogoIcon className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a
              href="https://buymeacoffee.com/hattahiroo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors flex items-center gap-1"
            >
              <HeartIcon className="w-3.5 h-3.5" />
              Support
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─── Composed export ────────────────────────────────────────────────────── */

export default function HomeBelowFold() {
  return (
    <>
      <HowItWorks />
      <DemoWalkthrough />
      <Features />
      <Testimonials />
      <FooterCTA />
    </>
  );
}
