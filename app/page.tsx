import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-text font-ui">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <Support />
      <Footer />
    </div>
  )
}

/* ─── Nav ─────────────────────────────────────────────────────────────────── */

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-surface-overlay backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-display text-lg text-text">resmd</span>
        <div className="flex items-center gap-3">
          <a
            href="https://buymeacoffee.com/hattahiroo"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors duration-150"
          >
            <CoffeeIcon size={14} />
            Support
          </a>
          <Link
            href="/auth"
            className="text-sm text-muted hover:text-text transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className="text-sm font-medium bg-accent hover:bg-accent-hover text-accent-text px-4 py-1.5 rounded-md transition-colors duration-150"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-accent-muted border border-accent/20 rounded-full px-3 py-1 mb-8">
            <span className="text-accent text-xs font-medium">ResMarkup</span>
            <span className="text-faint text-xs">Plain text. Beautiful output.</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl leading-[1.1] tracking-tight text-text mb-6">
            Your resume,{' '}
            <span className="text-accent text-glow-accent">written like a text file.</span>
          </h1>

          <p className="text-lg text-muted leading-relaxed mb-10 max-w-xl">
            Write in plain ResMarkup syntax. See it render live across beautiful templates.
            Manage multiple tailored variants. Let AI sharpen your words.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-accent-text font-medium px-6 py-3 rounded-lg transition-colors duration-150 shadow-accent"
            >
              Start for free
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 border border-border hover:border-border-strong text-muted hover:text-text px-6 py-3 rounded-lg transition-colors duration-150"
            >
              See how it works
            </a>
          </div>
          <p className="text-xs text-faint mt-4">Free to use · No credit card · No watermarks</p>
        </div>

        {/* Editor + preview mockup */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <EditorMockup />
          <PreviewMockup />
        </div>
      </div>
    </section>
  )
}

function EditorMockup() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-lg">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-2">
        <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
        <span className="ml-2 text-xs text-faint font-mono">resume.resmd</span>
      </div>
      {/* Code */}
      <pre className="p-5 text-xs leading-6 font-mono overflow-hidden">
        <CodeLine type="section"># Bio</CodeLine>
        <CodeLine type="kv">Name: Alex Rivera</CodeLine>
        <CodeLine type="kv">Title: Senior Software Engineer</CodeLine>
        <CodeLine type="kv">Email: alex@email.com</CodeLine>
        <CodeLine type="kv">Location: San Francisco, CA</CodeLine>
        <br />
        <CodeLine type="section"># Work Experience</CodeLine>
        <CodeLine type="entry">## Staff Engineer @ Stripe | 2022 – Present</CodeLine>
        <CodeLine type="bullet">- Led payments infra serving 1B+ transactions/year</CodeLine>
        <CodeLine type="bullet">- Reduced API latency by 38% through query optimization</CodeLine>
        <br />
        <CodeLine type="entry">## Senior Engineer @ Vercel | 2020 – 2022</CodeLine>
        <CodeLine type="bullet">- Owned the Edge Runtime deployment pipeline</CodeLine>
        <br />
        <CodeLine type="section"># Skills</CodeLine>
        <CodeLine type="kv">Languages: TypeScript, Go, Rust</CodeLine>
        <CodeLine type="kv">Infrastructure: AWS, Kubernetes, Terraform</CodeLine>
      </pre>
    </div>
  )
}

function CodeLine({ type, children }: { type: 'section' | 'entry' | 'kv' | 'bullet'; children: React.ReactNode }) {
  const color =
    type === 'section' ? 'text-accent font-bold' :
    type === 'entry'   ? 'text-text font-semibold' :
    type === 'kv'      ? 'text-secondary' :
                         'text-muted'
  return <div className={color}>{children}</div>
}

function PreviewMockup() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-border/30">
      <div className="p-6 text-[#1A1C23]">
        {/* Name/header */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-xl font-bold font-display text-[#1A1C23]">Alex Rivera</h2>
          <p className="text-sm text-gray-500 mt-0.5">Senior Software Engineer</p>
          <p className="text-xs text-gray-400 mt-1">alex@email.com · San Francisco, CA</p>
        </div>

        {/* Experience section */}
        <div className="mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Work Experience</h3>
          <div className="mb-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-[#1A1C23]">Staff Engineer</span>
              <span className="text-[10px] text-gray-400">2022 – Present</span>
            </div>
            <span className="text-xs text-gray-500">Stripe</span>
            <ul className="mt-1.5 space-y-0.5">
              <li className="text-[11px] text-gray-600 flex gap-1.5"><span>·</span><span>Led payments infra serving 1B+ transactions/year</span></li>
              <li className="text-[11px] text-gray-600 flex gap-1.5"><span>·</span><span>Reduced API latency by 38% through query optimization</span></li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-[#1A1C23]">Senior Engineer</span>
              <span className="text-[10px] text-gray-400">2020 – 2022</span>
            </div>
            <span className="text-xs text-gray-500">Vercel</span>
            <ul className="mt-1.5">
              <li className="text-[11px] text-gray-600 flex gap-1.5"><span>·</span><span>Owned the Edge Runtime deployment pipeline</span></li>
            </ul>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Skills</h3>
          <div className="space-y-0.5">
            <div className="flex gap-2 text-[11px]"><span className="text-gray-400 w-20 shrink-0">Languages</span><span className="text-gray-700">TypeScript, Go, Rust</span></div>
            <div className="flex gap-2 text-[11px]"><span className="text-gray-400 w-20 shrink-0">Infrastructure</span><span className="text-gray-700">AWS, Kubernetes, Terraform</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── How It Works ───────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Write in ResMarkup',
      body: 'Use a simple plain-text syntax — sections, entries, key-value pairs, bullets. No forms, no drag-and-drop. Just text.',
      code: '# Work Experience\n## Engineer @ Stripe | 2022–Now\n- Built payments infra',
    },
    {
      n: '02',
      title: 'See it live',
      body: 'Every keystroke updates the preview. Swap between templates instantly without touching a single line of your content.',
    },
    {
      n: '03',
      title: 'Clone for every job',
      body: 'Create tailored variants from any existing resume — a visual tree of all your versions. Clone, edit, export.',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl text-text mb-3">
          Simple by design
        </h2>
        <p className="text-muted mb-14 max-w-lg">
          Three steps. No onboarding wizard. No formatting toolbar. Just write.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.n} className="bg-surface border border-border rounded-xl p-6">
              <span className="text-xs font-mono text-accent mb-3 block">{step.n}</span>
              <h3 className="text-base font-semibold text-text mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">{step.body}</p>
              {step.code && (
                <pre className="text-xs font-mono text-secondary bg-surface-2 rounded-lg p-3 leading-5 whitespace-pre-wrap">
                  {step.code}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Features ───────────────────────────────────────────────────────────── */

function Features() {
  const features = [
    {
      icon: <FileTextIcon />,
      label: 'ResMarkup',
      title: 'Plain text you actually own',
      body: 'No proprietary format, no lock-in. ResMarkup is a readable text syntax you could write in any editor. The platform just makes it beautiful.',
    },
    {
      icon: <BranchIcon />,
      label: 'Variants',
      title: 'One base, many tailored versions',
      body: 'Clone any variant to create a new one. Software engineering CV, management track, freelance portfolio — all branched from a single source of truth.',
    },
    {
      icon: <SparkleIcon />,
      label: 'AI',
      title: 'AI that enhances, never replaces',
      body: 'Bullet enhancer, section reviewer, job match scoring. Every AI suggestion is shown as a diff — you decide what goes in.',
      accent: 'secondary',
    },
    {
      icon: <PaletteIcon />,
      label: 'Templates',
      title: 'Swap the look, keep the content',
      body: 'Minimal, Modern, Technical, Executive, Creative. Switch templates in one click — your ResMarkup renders perfectly in each.',
    },
  ]

  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl text-text mb-3">
          Built different
        </h2>
        <p className="text-muted mb-14 max-w-lg">
          Most resume builders are glorified word processors. resmd is a writing tool with publication-quality output.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-surface border border-border rounded-xl p-6 hover:border-border-strong transition-colors duration-200">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${f.accent === 'secondary' ? 'bg-secondary-muted text-secondary' : 'bg-accent-muted text-accent'}`}>
                {f.icon}
              </div>
              <div className={`text-xs font-medium mb-1 ${f.accent === 'secondary' ? 'text-secondary' : 'text-accent'}`}>
                {f.label}
              </div>
              <h3 className="text-base font-semibold text-text mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Support ────────────────────────────────────────────────────────────── */

function Support() {
  return (
    <section className="py-20 px-6 border-t border-border" id="support">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-accent-muted rounded-2xl flex items-center justify-center mx-auto mb-6 text-accent">
            <CoffeeIcon size={28} />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-text mb-4">
            resmd is free.
          </h2>
          <p className="text-muted text-base leading-relaxed mb-8">
            No credit card. No watermarks. No paywalls — for now.{' '}
            If resmd has helped you land a job or save a few hours, a coffee means a lot.
          </p>
          <a
            href="https://buymeacoffee.com/hattahiroo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#FFDD00] hover:bg-[#f0d000] text-[#1a1200] text-sm font-semibold rounded-lg transition-colors duration-150"
          >
            <CoffeeIcon size={16} />
            Buy me a coffee
          </a>
          <p className="text-xs text-faint mt-4">
            Every cup helps keep resmd free and actively maintained.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-display text-text">resmd</span>
          <p className="text-xs text-faint mt-1">Plain text resume builder</p>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="/auth" className="hover:text-text transition-colors duration-150">Sign in</Link>
          <a
            href="https://buymeacoffee.com/hattahiroo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors duration-150"
          >Support</a>
        </div>
      </div>
    </footer>
  )
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function CoffeeIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 3c0 1.5 1.5 1.5 1.5 3M13 3c0 1.5 1.5 1.5 1.5 3" />
      <path d="M5 9h14l-1.5 10.5a1 1 0 01-1 .5H7.5a1 1 0 01-1-.5L5 9z" />
      <path d="M19 11h1.5a2 2 0 010 4H19" />
    </svg>
  )
}

function FileTextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8L14 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BranchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 8v8M6 8c0 3 12 3 12 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="15.5" r="1.5" fill="currentColor" />
    </svg>
  )
}
