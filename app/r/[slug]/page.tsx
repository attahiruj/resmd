import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getVariantBySlug } from '@/lib/variantService';
import { getTemplate } from '@/lib/templates';
import { parseResume } from '@/lib/parser';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const variant = await getVariantBySlug(slug);
  if (!variant) return { title: 'Resume not found' };

  const parsed = parseResume(variant.rawContent);
  const name = parsed.meta.name ?? variant.title;
  const jobTitle = parsed.meta.title ?? '';
  const description = jobTitle
    ? `${name} — ${jobTitle}`
    : `${name}'s resume on resmd`;

  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      type: 'profile',
    },
  };
}

export default async function PublicResumePage({ params }: Props) {
  const { slug } = await params;
  const variant = await getVariantBySlug(slug);
  if (!variant) notFound();

  const template = getTemplate(variant.templateId) ?? getTemplate('minimal')!;
  const parsed = parseResume(variant.rawContent);
  const TemplateComponent = template.component;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-border bg-surface py-3 px-6 flex items-center justify-between flex-shrink-0">
        <Link
          href="/"
          className="text-base font-bold text-text select-none tracking-tight hover:opacity-80 transition-opacity"
        >
          res<span className="text-accent">md</span>
        </Link>
        <Link
          href="/auth"
          className="text-xs font-medium bg-accent text-accent-text px-3 py-1.5 rounded-md hover:bg-accent-hover transition-colors duration-150"
        >
          Create yours free →
        </Link>
      </header>

      {/* Resume render */}
      <main className="flex-1 py-8 px-4 overflow-auto">
        <div
          className="max-w-[800px] mx-auto rounded-xl overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        >
          <Suspense
            fallback={
              <div className="bg-white p-16 text-center text-sm text-gray-400">
                Loading resume…
              </div>
            }
          >
            <TemplateComponent resume={parsed} />
          </Suspense>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="border-t border-border bg-surface py-4 px-6 flex items-center justify-center gap-6 flex-shrink-0">
        <Link
          href="/auth"
          className="text-xs text-muted hover:text-text transition-colors duration-150"
        >
          Create your own resume at resmd →
        </Link>
      </footer>
    </div>
  );
}
