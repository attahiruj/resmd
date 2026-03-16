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

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Data We Collect
            </h2>
            <ul className="space-y-1.5 text-sm text-muted pl-4">
              <li>Account information (email) when you sign up</li>
              <li>Resume content you create and store</li>
              <li>Usage data to improve our service</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              How We Use Your Data
            </h2>
            <ul className="space-y-1.5 text-sm text-muted pl-4">
              <li>To provide and maintain our service</li>
              <li>To help you create and manage your resumes</li>
              <li>To improve our AI features</li>
              <li>To communicate with you about updates</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Third-Party Service Providers
            </h2>
            <p className="text-sm text-muted mb-3">
              We work with trusted third-party services to provide our platform:
            </p>
            <ul className="space-y-1.5 text-sm text-muted pl-4">
              <li>
                <strong>Supabase</strong> - Stores your account data and resume
                content securely. Your data is protected with row-level
                security.
              </li>
              <li>
                <strong>Stripe</strong> - Processes payments for any future
                premium features. We do not store your payment information.
              </li>
              <li>
                <strong>AI Providers</strong> - Used to power AI-assisted resume
                features. Resume content may be processed by AI services to
                provide suggestions and improvements.
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              AI Data Usage
            </h2>
            <p className="text-sm text-muted">
              Our AI features process your resume content to provide
              suggestions, improvements, and enhancements. This processing is
              done securely, and your content is not used to train public AI
              models. AI-generated suggestions are provided as assistance—you
              retain full ownership of all content.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Data Retention
            </h2>
            <p className="text-sm text-muted">
              We retain your account information and resume content for as long
              as your account is active. You can request deletion of your
              account and all associated data at any time. Upon account
              deletion, we will remove all your data from our active systems
              within 30 days, though some backup copies may remain for a
              reasonable period.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Data Security
            </h2>
            <p className="text-sm text-muted">
              We use industry-standard security measures to protect your data.
              Your resume content is stored securely with row-level security,
              ensuring only you can access your resumes.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">Cookies</h2>
            <p className="text-sm text-muted">
              We use minimal cookies to maintain your session and improve your
              experience. We do not use third-party advertising cookies. You can
              disable cookies in your browser settings, though some features may
              not function properly without them.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Your Rights
            </h2>
            <ul className="space-y-1.5 text-sm text-muted pl-4">
              <li>Access your data at any time</li>
              <li>Delete your account and all associated data</li>
              <li>Export your resume data</li>
              <li>Opt-out of non-essential communications</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Data Security
            </h2>
            <p className="text-sm text-muted">
              We use industry-standard security measures to protect your data.
              Your resume content is stored securely with row-level security,
              ensuring only you can access your resumes. We also implement
              encryption in transit and at rest. While no method of transmission
              over the internet is 100% secure, we continuously monitor and
              improve our security practices.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Data Breaches
            </h2>
            <p className="text-sm text-muted">
              In the event of a data breach that affects your personal
              information, we will notify you and relevant authorities as
              required by applicable law. We take security incidents seriously
              and have procedures in place to respond promptly.
            </p>
          </div>

          <div>
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
