import type { Metadata } from 'next'
import Link from 'next/link'
import { LIMITS } from '@/lib/limits'

export const metadata: Metadata = {
  title: 'Pricing',
  description: `resmd is free during early access. ${LIMITS.FREE_VARIANTS} resumes, all templates, PDF export, and AI assistance — no credit card required.`,
}

const FREE_FEATURES = [
  `Up to ${LIMITS.FREE_VARIANTS} resume variants`,
  'All templates (Minimal, Modern, Technical, Executive, Creative)',
  'PDF export',
  `AI assistant (${LIMITS.FREE_AI_PER_MONTH} uses/month)`,
  `${LIMITS.FREE_SNAPSHOTS} saved snapshots per resume`,
  'Public shareable link',
]

const PRO_FEATURES = [
  'Unlimited resume variants',
  'All templates',
  'Watermark-free PDF export',
  'Unlimited AI assistant',
  'Unlimited snapshot history',
  'Priority support',
]

const FAQ = [
  {
    q: "What's included in the free plan?",
    a: `Everything. During early access, all features are available for free — ${LIMITS.FREE_VARIANTS} resume variants, all 5 templates, PDF export, AI assistant, and shareable links.`,
  },
  {
    q: 'When does Pro launch?',
    a: "We're still in early access. Pro pricing will be introduced later, with advance notice to existing users. Early users will get a discount.",
  },
  {
    q: 'Is my data safe?',
    a: 'Your resume data is stored securely with row-level security. Only you can access your resumes.',
  },
  {
    q: 'Can I export to PDF for free?',
    a: 'Yes — PDF export is free for everyone during early access.',
  },
  {
    q: 'How many resumes can I create?',
    a: `Up to ${LIMITS.FREE_VARIANTS} resume variants on the free plan. Clone any resume to create a targeted variant for a specific job application.`,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Nav */}
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
              className="text-xs text-muted hover:text-text transition-colors duration-150 hidden sm:block"
            >
              ☕ Support
            </a>
            <Link
              href="/auth"
              className="text-sm font-medium bg-accent text-accent-text px-4 py-1.5 rounded-lg hover:bg-accent-hover transition-colors duration-150"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-block text-xs font-medium bg-accent-muted text-accent px-3 py-1 rounded-full mb-4">
            Early access — everything free
          </div>
          <h1 className="text-3xl font-bold text-text mb-3">
            Simple, honest pricing
          </h1>
          <p className="text-muted max-w-md mx-auto text-sm leading-relaxed">
            resmd is free while we&apos;re in early access. Pro features will be
            introduced later — early users will be the first to know and get a
            discount.
          </p>
        </div>

        {/* Pricing columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {/* Free */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="mb-5">
              <p className="text-xs text-muted font-medium uppercase tracking-wider mb-1">
                Free
              </p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-text">$0</span>
                <span className="text-muted text-sm mb-1">/ month</span>
              </div>
              <p className="text-xs text-muted mt-1">No credit card required</p>
            </div>

            <ul className="space-y-2.5 mb-6">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm text-text"
                >
                  <span className="text-accent mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/auth"
              className="block w-full text-center py-2 rounded-lg bg-accent text-accent-text text-sm font-medium hover:bg-accent-hover transition-colors duration-150"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-surface border border-accent/30 rounded-xl p-6 shadow-accent relative">
            <div className="absolute top-4 right-4 text-xs bg-accent-muted text-accent px-2 py-0.5 rounded-full font-medium">
              Coming soon
            </div>
            <div className="mb-5">
              <p className="text-xs text-muted font-medium uppercase tracking-wider mb-1">
                Pro
              </p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-text">
                  ${LIMITS.PRO_PRICE_MONTHLY}
                </span>
                <span className="text-muted text-sm mb-1">/ month</span>
              </div>
              <p className="text-xs text-muted mt-1">
                Early users get a discount
              </p>
            </div>

            <ul className="space-y-2.5 mb-6">
              {PRO_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm text-text"
                >
                  <span className="text-accent mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="block w-full text-center py-2 rounded-lg border border-border text-sm text-muted cursor-not-allowed opacity-60"
            >
              Coming soon — stay tuned
            </button>
          </div>
        </div>

        {/* Buy me a coffee */}
        <div className="text-center border border-border rounded-xl p-8 bg-surface mb-16">
          <p className="text-sm text-muted mb-3">
            If resmd is saving you time, consider buying me a coffee ☕
          </p>
          <a
            href="https://buymeacoffee.com/hattahiroo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 bg-warning text-warning-bg text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            ☕ Buy me a coffee
          </a>
          <p className="text-xs text-faint mt-3">
            Every coffee helps keep resmd free and maintained
          </p>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-lg font-semibold text-text mb-6 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                className="border border-border rounded-xl p-5 bg-surface"
              >
                <p className="text-sm font-medium text-text mb-1.5">{q}</p>
                <p className="text-sm text-muted leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-faint">
          Everything is free while resmd is in early access.{" "}
          <Link
            href="/dashboard"
            className="text-muted hover:text-text transition-colors duration-150"
          >
            Start building →
          </Link>
        </p>
      </footer>
    </div>
  );
}
