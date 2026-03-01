import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'resmd terms of service - Terms and conditions for using our service.',
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-text mb-6">Terms of Service</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-muted mb-6">
            Please read these terms carefully before using resmd. By using our
            service, you agree to these terms.
          </p>

          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Acceptable Use
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Use the service for creating and managing resumes</li>
              <li>• Do not use the service for any illegal purposes</li>
              <li>• Do not attempt to hack or abuse the service</li>
              <li>• Respect other users and our team</li>
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Your Content
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>• You retain ownership of all content you create</li>
              <li>
                • You&apos;re responsible for the accuracy of your resume
                content
              </li>
              <li>• You can delete your content at any time</li>
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Service Availability
            </h2>
            <p className="text-sm text-muted">
              We strive to keep the service available, but we cannot guarantee
              uninterrupted access. The service may be temporarily unavailable
              for maintenance or due to factors beyond our control.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Early Access
            </h2>
            <p className="text-sm text-muted">
              resmd is currently in early access. Features may change, and we
              reserve the right to modify the service during this period.
              We&apos;ll provide notice of significant changes.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-text mb-4">Disclaimer</h2>
            <p className="text-sm text-muted">
              The service is provided &quot;as is&quot; without warranties of
              any kind. We don&apos;t guarantee that the service will meet your
              requirements or be error-free.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Contact Us</h2>
            <p className="text-sm text-muted">
              If you have any questions about these Terms of Service, please
              reach out to us.
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
