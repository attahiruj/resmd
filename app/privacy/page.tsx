import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'resmd privacy policy - How we handle your data.',
};

export default function PrivacyPage() {
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
              Support
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

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-text mb-6">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-muted mb-6">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your information.
          </p>

          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Data We Collect
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Account information (email) when you sign up</li>
              <li>• Resume content you create and store</li>
              <li>• Usage data to improve our service</li>
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              How We Use Your Data
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>• To provide and maintain our service</li>
              <li>• To help you create and manage your resumes</li>
              <li>• To improve our AI features</li>
              <li>• To communicate with you about updates</li>
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Data Security
            </h2>
            <p className="text-sm text-muted">
              We use industry-standard security measures to protect your data.
              Your resume content is stored securely with row-level security,
              ensuring only you can access your resumes.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Your Rights
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Access your data at any time</li>
              <li>• Delete your account and all associated data</li>
              <li>• Export your resume data</li>
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Contact Us</h2>
            <p className="text-sm text-muted">
              If you have any questions about this Privacy Policy, please reach
              out to us.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-faint">
          © {new Date().getFullYear()} resmd. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
