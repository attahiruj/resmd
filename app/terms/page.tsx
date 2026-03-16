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

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Acceptable Use
            </h2>
            <ul className="space-y-1.5 text-sm text-muted pl-4">
              <li>Use the service for creating and managing resumes</li>
              <li>Do not use the service for any illegal purposes</li>
              <li>Do not attempt to hack or abuse the service</li>
              <li>Respect other users and our team</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Your Content
            </h2>
            <ul className="space-y-1.5 text-sm text-muted pl-4">
              <li>You retain ownership of all content you create</li>
              <li>
                You&apos;re responsible for the accuracy of your resume content
              </li>
              <li>You can delete your content at any time</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Service Availability
            </h2>
            <p className="text-sm text-muted">
              We strive to keep the service available, but we cannot guarantee
              uninterrupted access. The service may be temporarily unavailable
              for maintenance or due to factors beyond our control.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Early Access
            </h2>
            <p className="text-sm text-muted">
              resmd is currently in early access. Features may change, and we
              reserve the right to modify the service during this period.
              We&apos;ll provide notice of significant changes.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Third-Party Services
            </h2>
            <p className="text-sm text-muted">
              Our service uses third-party providers to deliver functionality:
            </p>
            <ul className="space-y-1.5 text-sm text-muted pl-4 mt-2">
              <li>
                <strong>Supabase</strong> - Database and authentication
              </li>
              <li>
                <strong>Stripe</strong> - Payment processing (for future paid
                features)
              </li>
              <li>
                <strong>AI Services</strong> - AI-powered features to assist
                with resume creation
              </li>
            </ul>
            <p className="text-sm text-muted mt-2">
              These providers have their own terms and privacy policies.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Termination
            </h2>
            <p className="text-sm text-muted">
              We reserve the right to suspend or terminate your access to the
              service at our sole discretion for any violation of these terms or
              for any other reason. You may also delete your account at any time
              through your account settings.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">Disclaimer</h2>
            <p className="text-sm text-muted">
              The service is provided &quot;as is&quot; without warranties of
              any kind. We don&apos;t guarantee that the service will meet your
              requirements or be error-free.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Limitation of Liability
            </h2>
            <p className="text-sm text-muted">
              To the maximum extent permitted by law, resmd shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages, including without limitation loss of profits, data, or
              other intangible losses resulting from your use or inability to
              use the service.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-3">
              Governing Law
            </h2>
            <p className="text-sm text-muted">
              These Terms of Service shall be governed by and construed in
              accordance with applicable laws, without regard to conflict of law
              provisions.
            </p>
          </div>

          <div>
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
