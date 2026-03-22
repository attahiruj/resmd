import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help',
  description: 'How to use resmd — syntax, AI tools, templates, and more.',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-text select-none tracking-tight hover:opacity-80 transition-opacity"
          >
            res<span className="text-accent">md</span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://buymeacoffee.com/hattahiroo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-text transition-colors hidden sm:block"
            >
              Support
            </a>
            <Link
              href="/auth"
              className="text-sm font-medium bg-accent text-accent-text px-4 py-1.5 rounded-lg hover:bg-accent-hover transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16 lg:grid lg:grid-cols-[220px_1fr] lg:gap-16">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-8 text-sm space-y-0.5">
            <p className="text-xs text-faint uppercase tracking-widest mb-3">
              Contents
            </p>
            <Toc href="#quick-start">Quick Start</Toc>
            <Toc href="#resmarkup">ResMarkup Syntax</Toc>
            <Toc href="#sections" indent>
              Sections
            </Toc>
            <Toc href="#entries" indent>
              Entries
            </Toc>
            <Toc href="#key-value" indent>
              Key-value pairs
            </Toc>
            <Toc href="#bullets" indent>
              Bullets
            </Toc>
            <Toc href="#inline" indent>
              Inline formatting
            </Toc>
            <Toc href="#directives" indent>
              Directives
            </Toc>
            <Toc href="#editor">The Editor</Toc>
            <Toc href="#ai">AI Features</Toc>
            <Toc href="#ai-enhance" indent>
              Enhance
            </Toc>
            <Toc href="#ai-chat" indent>
              Chat
            </Toc>
            <Toc href="#variants">Variants</Toc>
            <Toc href="#templates">Templates</Toc>
            <Toc href="#export">Exporting PDF</Toc>
            <Toc href="#publishing">Publishing</Toc>
          </nav>
        </aside>

        <main className="min-w-0 space-y-14">
          <div>
            <h1 className="font-display text-3xl text-text mb-2">Help</h1>
            <p className="text-muted">
              resmd is a plain-text resume editor. You write in ResMarkup, pick
              a template, and export to PDF.
            </p>
          </div>

          {/* ── Quick Start ─────────────────────────────────────────────── */}
          <section id="quick-start" className="scroll-mt-8">
            <H2>Quick Start</H2>
            <ol className="list-decimal list-inside space-y-2 text-muted text-sm">
              <li>Sign in — free, no credit card.</li>
              <li>
                Click <strong className="text-text">New resume</strong> on the
                dashboard. A sample resume is pre-filled.
              </li>
              <li>
                Edit the left pane. The preview on the right updates as you
                type.
              </li>
              <li>
                Use the template picker in the preview pane to change the
                design.
              </li>
              <li>
                Click <strong className="text-text">Export PDF</strong> in the
                toolbar when you&apos;re done.
              </li>
            </ol>
          </section>

          {/* ── ResMarkup ───────────────────────────────────────────────── */}
          <section id="resmarkup" className="scroll-mt-8">
            <H2>ResMarkup Syntax</H2>
            <p className="text-muted text-sm mb-6">
              ResMarkup is a plain-text format for resumes. There&apos;s no
              fixed schema — you define your own sections and structure.
              Here&apos;s a full example:
            </p>
            <Code>{`# Bio
Name: Alex Rivera
Title: Software Engineer
Email: alex@email.com
Location: Berlin, Germany

# Experience
## Engineer @ Stripe | 2022–Present | Remote
- Built payment reconciliation service handling €2B/month
- Reduced checkout API latency by 38%

## Engineer @ Vercel | 2020–2022
- Worked on edge runtime infrastructure

# Skills
Languages: TypeScript, Go, Rust
Infra: Kubernetes, Terraform, AWS

# Education
## B.Sc. Computer Science @ TU Berlin | 2016–2020`}</Code>

            <div id="sections" className="scroll-mt-8 mt-10">
              <H3>Sections</H3>
              <p className="text-muted text-sm mb-3">
                A <C>#</C> followed by any name creates a section. Call them
                whatever makes sense for you.
              </p>
              <Code>{`# Experience
# Skills
# Education
# Projects
# Side Quests`}</Code>
            </div>

            <div id="entries" className="scroll-mt-8 mt-10">
              <H3>Entries</H3>
              <p className="text-muted text-sm mb-3">
                <C>##</C> creates an entry inside a section — a job, project,
                degree, etc. Use <C>@</C> to separate role from organisation,
                and <C>|</C> to add date, location, or URL. All optional.
              </p>
              <Code>{`## Role @ Organization | Date | Location | URL

## Engineer @ Stripe | 2022–Present | Remote | https://stripe.com
## Contributor @ React | 2021
## Side Project | 2023 | https://myproject.dev`}</Code>
              <Note>
                Fields after <C>|</C> can appear in any order — the parser
                detects URLs, date ranges, and locations automatically.
              </Note>
            </div>

            <div id="key-value" className="scroll-mt-8 mt-10">
              <H3>Key-value pairs</H3>
              <p className="text-muted text-sm mb-3">
                <C>Key: Value</C> pairs render as a definition list. Mainly used
                in a Bio section for contact info, but work anywhere.
              </p>
              <Code>{`# Bio
Name: Alex Rivera
Title: Software Engineer
Email: alex@email.com
Phone: +49 000 000 0000
Location: Berlin, Germany
GitHub: github.com/alexrivera`}</Code>
              <Note>
                <C>Name</C>, <C>Email</C>, and <C>Title</C> are used to populate
                the resume header across all templates.
              </Note>
            </div>

            <div id="bullets" className="scroll-mt-8 mt-10">
              <H3>Bullet points</H3>
              <p className="text-muted text-sm mb-3">
                Lines starting with <C>-</C> become bullets. They nest under the
                nearest <C>##</C> entry, or stand alone in a section (handy for
                skills).
              </p>
              <Code>{`# Skills
- TypeScript, Go, Python
- PostgreSQL, Redis, Kafka

# Experience
## Engineer @ Acme | 2021–2023
- Shipped features used by 500K+ users
- Cut infrastructure cost by 25%`}</Code>
            </div>

            <div id="inline" className="scroll-mt-8 mt-10">
              <H3>Inline formatting</H3>
              <p className="text-muted text-sm mb-4">
                Works inside any line — bullets, paragraphs, key values, and
                entry headings.
              </p>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-6 text-faint font-medium">Syntax</th>
                    <th className="py-2 pr-6 text-faint font-medium">Result</th>
                    <th className="py-2 text-faint font-medium">Example</th>
                  </tr>
                </thead>
                <tbody className="text-muted text-xs">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-6 font-mono text-accent">*text*</td>
                    <td className="py-2 pr-6">Bold</td>
                    <td className="py-2 font-mono text-secondary">
                      *Reduced latency by 38%*
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-6 font-mono text-accent">~text~</td>
                    <td className="py-2 pr-6">Italic</td>
                    <td className="py-2 font-mono text-secondary">
                      ~Open to remote roles~
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-6 font-mono text-accent">_text_</td>
                    <td className="py-2 pr-6">Underline</td>
                    <td className="py-2 font-mono text-secondary">
                      _Key project_
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-6 font-mono text-accent">
                      [text](url)
                    </td>
                    <td className="py-2 pr-6">Link</td>
                    <td className="py-2 font-mono text-secondary">
                      [GitHub](https://github.com)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 font-mono text-accent">
                      [Placeholder]
                    </td>
                    <td className="py-2 pr-6">Reminder</td>
                    <td className="py-2 font-mono text-secondary">
                      [add metric here]
                    </td>
                  </tr>
                </tbody>
              </table>
              <Note variant="warning">
                Bracketed placeholders like <C>[add metric here]</C> show as
                highlights in the preview and trigger a warning before PDF
                export — a reminder to fill them in.
              </Note>
            </div>

            <div id="directives" className="scroll-mt-8 mt-10">
              <H3>Directives</H3>
              <p className="text-muted text-sm mb-3">
                Lines starting with <C>!</C> control PDF layout. They&apos;re
                invisible in the rendered output. Put them at the top of your
                document.
              </p>
              <Code>{`!font.size: 11
!line.height: 1.45
!margin.h: 50
!margin.v: 40
!entry.spacing: 7`}</Code>
              <table className="w-full text-sm border-collapse mt-4">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-6 text-faint font-medium">
                      Directive
                    </th>
                    <th className="py-2 pr-4 text-faint font-medium">Unit</th>
                    <th className="py-2 pr-4 text-faint font-medium">
                      Default
                    </th>
                    <th className="py-2 text-faint font-medium">
                      What it does
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted text-xs">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-6 font-mono text-accent">
                      !font.size
                    </td>
                    <td className="py-2 pr-4">pt</td>
                    <td className="py-2 pr-4 font-mono">11</td>
                    <td className="py-2">Base font size</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-6 font-mono text-accent">
                      !line.height
                    </td>
                    <td className="py-2 pr-4">ratio</td>
                    <td className="py-2 pr-4 font-mono">1.4</td>
                    <td className="py-2">Line spacing</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-6 font-mono text-accent">
                      !margin.h
                    </td>
                    <td className="py-2 pr-4">pt</td>
                    <td className="py-2 pr-4 font-mono">50</td>
                    <td className="py-2">Left & right margins</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-6 font-mono text-accent">
                      !margin.v
                    </td>
                    <td className="py-2 pr-4">pt</td>
                    <td className="py-2 pr-4 font-mono">40</td>
                    <td className="py-2">Top & bottom margins</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 font-mono text-accent">
                      !entry.spacing
                    </td>
                    <td className="py-2 pr-4">pt</td>
                    <td className="py-2 pr-4 font-mono">8</td>
                    <td className="py-2">Gap between entries</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Editor ──────────────────────────────────────────────────── */}
          <section id="editor" className="scroll-mt-8">
            <H2>The Editor</H2>
            <p className="text-muted text-sm mb-4">
              Split-pane — source on the left, live preview on the right.
              Autosaves a couple of seconds after you stop typing; the toolbar
              shows when it last saved.
            </p>
            <ul className="text-sm text-muted space-y-2 mb-6">
              <li>
                <strong className="text-text">Jump to source</strong> —
                double-click any word in the preview to jump to it in the
                editor.
              </li>
              <li>
                <strong className="text-text">Resize panes</strong> — drag the
                divider. On mobile, use the Write / Preview tabs.
              </li>
              <li>
                <strong className="text-text">Rename</strong> — click the title
                in the toolbar to edit inline.
              </li>
            </ul>
            <H3>Keyboard shortcuts</H3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-8 text-faint font-medium">Shortcut</th>
                  <th className="py-2 text-faint font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-muted text-sm">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-8">
                    <Kbd>Ctrl+B</Kbd>
                  </td>
                  <td className="py-2">Toggle bold</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-8">
                    <Kbd>Ctrl+I</Kbd>
                  </td>
                  <td className="py-2">Toggle italic</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-8">
                    <Kbd>Ctrl+U</Kbd>
                  </td>
                  <td className="py-2">Toggle underline</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-8">
                    <Kbd>Ctrl+Z</Kbd>
                  </td>
                  <td className="py-2">Undo</td>
                </tr>
                <tr>
                  <td className="py-2 pr-8">
                    <Kbd>Ctrl+Shift+Z</Kbd>
                  </td>
                  <td className="py-2">Redo</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* ── AI ──────────────────────────────────────────────────────── */}
          <section id="ai" className="scroll-mt-8">
            <H2>AI Features</H2>
            <p className="text-muted text-sm mb-6">
              Two tools: <strong className="text-text">Enhance</strong> rewrites
              a selection in place, and{' '}
              <strong className="text-text">Chat</strong> lets you have a
              back-and-forth about the whole resume.
            </p>

            <div id="ai-enhance" className="scroll-mt-8">
              <H3>Enhance</H3>
              <p className="text-muted text-sm mb-3">
                Highlight any text in the editor — a text box appears. Type an
                instruction and press Enter. The AI rewrites just that selection
                and inserts it directly. Hit <Kbd>Ctrl+Z</Kbd> to undo if you
                don&apos;t like it.
              </p>
              <p className="text-muted text-sm mb-2">Some things to try:</p>
              <ul className="text-sm font-mono text-secondary space-y-1">
                <li>make this more concise</li>
                <li>add a metric</li>
                <li>use a stronger action verb</li>
                <li>rewrite for a management role</li>
              </ul>
            </div>

            <div id="ai-chat" className="scroll-mt-8 mt-8">
              <H3>Chat</H3>
              <p className="text-muted text-sm mb-3">
                The chat panel has your full resume as context. Ask for
                feedback, request a rewrite of a section, or describe the role
                you&apos;re applying for and ask what&apos;s missing.
              </p>
              <p className="text-muted text-sm mb-3">
                When the AI wants to change something in your resume, it sends
                an <strong className="text-text">edit block</strong> — the exact
                text to replace and what to replace it with. You can accept or
                dismiss each one individually.
              </p>
              <p className="text-muted text-sm mb-2">Some things to try:</p>
              <ul className="text-sm font-mono text-secondary space-y-1 mb-4">
                <li>what&apos;s weak about my experience section?</li>
                <li>
                  I&apos;m applying for a staff role — what&apos;s missing?
                </li>
                <li>tighten up my bio</li>
              </ul>
              <p className="text-muted text-sm">
                You can swap models using the dropdown in the chat panel header.
                The choice is saved locally.
              </p>
            </div>
          </section>

          {/* ── Variants ────────────────────────────────────────────────── */}
          <section id="variants" className="scroll-mt-8">
            <H2>Variants</H2>
            <p className="text-muted text-sm mb-3">
              A variant is a version of your resume. The typical workflow: keep
              one &ldquo;master&rdquo; with everything, then clone it per
              application to trim and tailor.
            </p>
            <ul className="text-sm text-muted space-y-2">
              <li>
                <strong className="text-text">Create</strong> — click New resume
                on the dashboard.
              </li>
              <li>
                <strong className="text-text">Clone</strong> — use the overflow
                menu on any resume card.
              </li>
              <li>
                <strong className="text-text">Delete</strong> — also in the
                overflow menu. Permanent, so export first if needed.
              </li>
            </ul>
          </section>

          {/* ── Templates ───────────────────────────────────────────────── */}
          <section id="templates" className="scroll-mt-8">
            <H2>Templates</H2>
            <p className="text-muted text-sm mb-4">
              Templates change the visual design — layout, fonts, colors —
              without touching your content. Switch via the dropdown in the
              preview pane, or browse the{' '}
              <Link href="/templates" className="text-accent hover:underline">
                template gallery
              </Link>
              .
            </p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-6 text-faint font-medium">Template</th>
                  <th className="py-2 text-faint font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="text-muted text-sm">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-6">Minimal</td>
                  <td className="py-2">Clean, works for any field</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-6">Modern</td>
                  <td className="py-2">Two-column layout</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-6">Technical</td>
                  <td className="py-2">Compact, good for tech roles</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-6">Executive</td>
                  <td className="py-2">Senior / leadership positions</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6">Creative</td>
                  <td className="py-2">Design and creative roles</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* ── Export ──────────────────────────────────────────────────── */}
          <section id="export" className="scroll-mt-8">
            <H2>Exporting to PDF</H2>
            <p className="text-muted text-sm mb-4">
              Click <strong className="text-text">Export PDF</strong> in the
              toolbar. The file downloads automatically.
            </p>
            <p className="text-muted text-sm mb-3">
              If your resume has <C>[bracketed placeholders]</C>, a warning
              appears first — you can still export, it&apos;s just a reminder.
            </p>
            <p className="text-muted text-sm mb-2">
              If the content overflows a page, tweak the directives:
            </p>
            <Code>{`!font.size: 10
!margin.v: 32
!entry.spacing: 5`}</Code>
          </section>

          {/* ── Publishing ──────────────────────────────────────────────── */}
          <section id="publishing" className="scroll-mt-8">
            <H2>Publishing</H2>
            <p className="text-muted text-sm mb-3">
              Public resume sharing is coming soon. You&apos;ll be able to
              publish any variant to get a shareable URL at{' '}
              <C>resmd.app/r/your-slug</C>.
            </p>
          </section>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted">
              Still stuck? Open a GitHub issue.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/attahiruj/resmd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-text border border-border px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <GitHubIcon className="w-4 h-4" />
                Star on GitHub
              </a>
              <a
                href="https://github.com/attahiruj/resmd/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-text border border-border px-4 py-2 rounded-lg transition-colors"
              >
                Open an issue
              </a>
              <Link
                href="/auth"
                className="text-sm font-medium bg-accent text-accent-text px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
              >
                Start writing
              </Link>
            </div>
          </div>
        </main>
      </div>

      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-faint">
          © {new Date().getFullYear()} resmd. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

/* ── Small helpers — easy to update without touching page content ─────── */

function Toc({
  href,
  children,
  indent,
}: {
  href: string;
  children: React.ReactNode;
  indent?: boolean;
}) {
  return (
    <a
      href={href}
      className={`block py-1 text-muted hover:text-text transition-colors ${indent ? 'pl-4 text-xs' : ''}`}
    >
      {children}
    </a>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl text-text mb-4 pb-2 border-b border-border">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-text mb-2 mt-6">{children}</h3>;
}

function Code({ children }: { children: string }) {
  return (
    <pre className="text-xs font-mono leading-6 text-secondary bg-surface border border-border rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function C({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-accent text-[0.8em] bg-surface border border-border/60 rounded px-1">
      {children}
    </code>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="font-mono text-xs bg-surface-2 border border-border rounded px-1.5 py-0.5 text-text">
      {children}
    </kbd>
  );
}

function Note({
  children,
  variant = 'info',
}: {
  children: React.ReactNode;
  variant?: 'info' | 'warning';
}) {
  return (
    <p
      className={`text-xs mt-3 pl-3 border-l-2 ${variant === 'warning' ? 'border-warning/50 text-muted' : 'border-accent/40 text-muted'}`}
    >
      {children}
    </p>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
