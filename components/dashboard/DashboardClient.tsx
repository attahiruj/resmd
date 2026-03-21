'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlusIcon,
  TrashIcon,
  SpinnerGapIcon,
  PencilSimpleIcon,
  CopySimpleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SquaresFourIcon,
  ListIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  FileTextIcon,
  SunIcon,
  MoonIcon,
  ChatTeardropTextIcon,
} from '@phosphor-icons/react';
import type { ResumeVariant } from '@/types/resume';
import { parseResume } from '@/lib/parser';
import { getTemplate } from '@/lib/templates';
import { LIMITS } from '@/lib/limits';
import { applyTheme, getStoredThemePrefs } from '@/lib/themes';
import CloneModal from '@/components/variants/CloneModal';
import OnboardingModal from '@/components/ui/OnboardingModal';
import FeedbackModal from '@/components/ui/FeedbackModal';
import Navbar from '@/components/ui/Navbar';

interface DashboardClientProps {
  initialVariants: ResumeVariant[];
  isPro: boolean;
  userEmail: string;
}

type SortOption = 'updatedAt' | 'title' | 'templateId';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

const TEMPLATE_INFO: Record<string, { name: string; color: string }> = {
  minimal: { name: 'Minimal', color: 'var(--color-template-minimal)' },
  modern: { name: 'Modern', color: 'var(--color-template-modern)' },
  executive: { name: 'Executive', color: 'var(--color-template-executive)' },
  creative: { name: 'Creative', color: 'var(--color-template-creative)' },
  technical: { name: 'Technical', color: 'var(--color-template-technical)' },
};

const TEMPLATE_PREVIEWS = [
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple design' },
  { id: 'modern', name: 'Modern', description: 'Contemporary layout' },
  { id: 'executive', name: 'Executive', description: 'Professional look' },
  { id: 'creative', name: 'Creative', description: 'Stand out from the crowd' },
  { id: 'technical', name: 'Technical', description: 'For tech roles' },
];

// Sample resume content for each template - used when creating new resumes
const TEMPLATE_CONTENT: Record<string, string> = {
  minimal: `# Bio
Name: Amara Osei
Title: Full Stack Engineer
Email: amara@example.com
Location: Lagos, Nigeria
GitHub: github.com/amaraosei
LinkedIn: linkedin.com/in/amaraosei

# Summary
Full stack engineer with 4 years building products across fintech and edtech.
Strong backend focus with React on the frontend. Passionate about developer tooling.

# Experience
## Senior Engineer @ Paystack | 2022 – Present
- Architected a transaction reconciliation service processing ₦2B daily
- Reduced API response time by 60% through query optimization and caching
- Mentored 3 junior engineers through a structured onboarding program

## Software Engineer @ Andela | 2020 – 2022
- Built React component library used across 12 client projects
- Led migration from REST to GraphQL, reducing over-fetching by 40%

# Education
## B.Sc Computer Science @ University of Lagos | 2016 – 2020
First Class Honours. Final year project: real-time collaborative code editor.

# Skills
Languages: TypeScript, Python, Go
Frontend: React, Next.js, Tailwind CSS
Backend: Node.js, FastAPI, PostgreSQL, Redis
Infrastructure: Docker, AWS, GitHub Actions

# Projects
## resmd | github.com/amara/resmd | 2024
Plain-text resume builder with live preview and AI enhancement.
- Built parser in TypeScript with zero dependencies
- 300+ GitHub stars in 6 weeks after launch

# Certifications
AWS Solutions Architect Associate | Amazon | 2023`,

  modern: `# Bio
Name: Amara Osei
Title: Full Stack Engineer
Email: amara@example.com
Location: Lagos, Nigeria
GitHub: github.com/amaraosei
LinkedIn: linkedin.com/in/amaraosei

# Summary
Full stack engineer with 4 years building products across fintech and edtech.
Strong backend focus with React on the frontend. Passionate about developer tooling.

# Experience
## Senior Engineer @ Paystack | 2022 – Present
- Architected a transaction reconciliation service processing ₦2B daily
- Reduced API response time by 60% through query optimization and caching
- Mentored 3 junior engineers through a structured onboarding program

## Software Engineer @ Andela | 2020 – 2022
- Built React component library used across 12 client projects
- Led migration from REST to GraphQL, reducing over-fetching by 40%

# Education
## B.Sc Computer Science @ University of Lagos | 2016 – 2020
First Class Honours. Final year project: real-time collaborative code editor.

# Skills
Languages: TypeScript, Python, Go
Frontend: React, Next.js, Tailwind CSS
Backend: Node.js, FastAPI, PostgreSQL, Redis
Infrastructure: Docker, AWS, GitHub Actions

# Projects
## resmd | github.com/amara/resmd | 2024
Plain-text resume builder with live preview and AI enhancement.
- Built parser in TypeScript with zero dependencies
- 300+ GitHub stars in 6 weeks after launch

# Certifications
AWS Solutions Architect Associate | Amazon | 2023`,

  technical: `# Bio
Name: Amara Osei
Title: Full Stack Engineer
Email: amara@example.com
Location: Lagos, Nigeria
GitHub: github.com/amaraosei
LinkedIn: linkedin.com/in/amaraosei

# Summary
Full stack engineer with 4 years building products across fintech and edtech.
Strong backend focus with React on the frontend. Passionate about developer tooling.

# Experience
## Senior Engineer @ Paystack | 2022 – Present
- Architected a transaction reconciliation service processing ₦2B daily
- Reduced API response time by 60% through query optimization and caching
- Mentored 3 junior engineers through a structured onboarding program

## Software Engineer @ Andela | 2020 – 2022
- Built React component library used across 12 client projects
- Led migration from REST to GraphQL, reducing over-fetching by 40%

# Education
## B.Sc Computer Science @ University of Lagos | 2016 – 2020
First Class Honours. Final year project: real-time collaborative code editor.

# Skills
Languages: TypeScript, Python, Go
Frontend: React, Next.js, Tailwind CSS
Backend: Node.js, FastAPI, PostgreSQL, Redis
Infrastructure: Docker, AWS, GitHub Actions

# Projects
## resmd | github.com/amara/resmd | 2024
Plain-text resume builder with live preview and AI enhancement.
- Built parser in TypeScript with zero dependencies
- 300+ GitHub stars in 6 weeks after launch

# Certifications
AWS Solutions Architect Associate | Amazon | 2023`,

  executive: `# Bio
Name: Amara Osei
Title: Senior Engineering Lead
Email: amara@example.com
Location: Lagos, Nigeria
GitHub: github.com/amaraosei
LinkedIn: linkedin.com/in/amaraosei

# Summary
Strategic engineering leader with 6+ years of experience building and scaling high-performance teams.
Proven track record of delivering mission-critical systems serving millions of users.
Passionate about building inclusive engineering cultures and developing future leaders.

# Experience
## Engineering Lead @ Paystack | 2022 – Present
- Led team of 8 engineers building payment infrastructure processing $2B annually
- Established engineering best practices and code review standards
- Mentored 3 engineers into senior roles, all promoted within 18 months

## Senior Engineer @ Andela | 2020 – 2022
- Architected React component library used across 12 client projects
- Technical interview panel member, conducted 100+ interviews

# Education
## MBA @ Lagos Business School | 2022
Strategic Management

## B.Sc Computer Science @ University of Lagos | 2016 – 2020
First Class Honours

# Skills
Leadership: Team Building, Strategic Planning, Budget Management
Tech: TypeScript, Python, Go, React, Node.js, PostgreSQL, AWS

# Certifications
AWS Solutions Architect Associate | Amazon | 2023
Executive Leadership | Stanford Graduate School of Business | 2024`,

  creative: `# Bio
Name: Amara Osei
Title: Creative Developer & Designer
Email: amara@example.com
Location: Lagos, Nigeria
Portfolio: amara.design
GitHub: github.com/amaraosei

# About
I build digital experiences that users love. With a unique blend of design sensibility
and engineering rigor, I create products that are both beautiful and functional.

# Experience
## Creative Developer @ Digital Agency | 2022 – Present
- Built award-winning interactive experiences for Fortune 500 clients
- Combined motion design with performant code
- Reduced page load times by 40% while adding animations

## Frontend Developer @ Startup | 2020 – 2022
- Designed and built product UI from scratch
- Created design system used across 8 products
- Increased user engagement by 60%

# Education
## B.Design @ Creative Arts Institute | 2016 – 2020
Major in Interactive Design, Minor in Computer Science

# Skills
Design: Figma, Adobe XD, Motion Design, UI/UX
Code: TypeScript, React, Three.js, WebGL, CSS Animations

# Selected Work
## Interactive Data Visualization | 2023
Award-winning data visualization for climate change data
- Featured in Awwwards SOTD
- 500k+ views

# Let's Connect
Open to creative development opportunities and design engineering roles.`,
};

export default function DashboardClient({
  initialVariants,
  isPro,
  userEmail,
}: DashboardClientProps) {
  const [variants, setVariants] = useState(initialVariants);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cloneSource, setCloneSource] = useState<ResumeVariant | null>(null);
  const [cloning, setCloning] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const router = useRouter();

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

  useEffect(() => {
    if (!localStorage.getItem('resmd_onboarded')) {
      setShowOnboarding(true);
    }
  }, []);

  const atLimit = !isPro && variants.length >= LIMITS.FREE_VARIANTS;

  // Filter and sort variants
  const filteredVariants = useMemo(() => {
    let result = [...variants];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((v) => v.title.toLowerCase().includes(query));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'templateId':
          comparison = a.templateId.localeCompare(b.templateId);
          break;
        case 'updatedAt':
        default:
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [variants, searchQuery, sortBy, sortDirection]);

  const handleNewResume = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'My Resume',
          rawContent: TEMPLATE_CONTENT.minimal,
          templateId: 'minimal',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create variant');
      router.push(`/editor/${data.data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create resume');
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/variants/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setVariants((prev) => prev.filter((v) => v.id !== id));
    } catch {
      alert('Failed to delete variant');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloneConfirm = async (title: string) => {
    if (!cloneSource) return;
    setCloning(true);
    try {
      const res = await fetch(`/api/variants/${cloneSource.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to clone');
      router.push(`/editor/${data.data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to clone variant');
      setCloning(false);
    }
  };

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  const SortMenu = () => (
    <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-20">
      <button
        onClick={() => {
          toggleSort('updatedAt');
          setShowSortMenu(false);
        }}
        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-surface-2 transition-colors ${sortBy === 'updatedAt' ? 'text-accent' : 'text-text'}`}
      >
        <span className="flex items-center gap-2">
          <ClockIcon size={16} />
          Last Modified
        </span>
        {sortBy === 'updatedAt' &&
          (sortDirection === 'asc' ? (
            <ArrowUpIcon size={14} />
          ) : (
            <ArrowDownIcon size={14} />
          ))}
      </button>
      <button
        onClick={() => {
          toggleSort('title');
          setShowSortMenu(false);
        }}
        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-surface-2 transition-colors ${sortBy === 'title' ? 'text-accent' : 'text-text'}`}
      >
        <span className="flex items-center gap-2">
          <FileTextIcon size={16} />
          Title
        </span>
        {sortBy === 'title' &&
          (sortDirection === 'asc' ? (
            <ArrowUpIcon size={14} />
          ) : (
            <ArrowDownIcon size={14} />
          ))}
      </button>
      <button
        onClick={() => {
          toggleSort('templateId');
          setShowSortMenu(false);
        }}
        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-surface-2 transition-colors ${sortBy === 'templateId' ? 'text-accent' : 'text-text'}`}
      >
        <span className="flex items-center gap-2">
          <SquaresFourIcon size={16} />
          Template
        </span>
        {sortBy === 'templateId' &&
          (sortDirection === 'asc' ? (
            <ArrowUpIcon size={14} />
          ) : (
            <ArrowDownIcon size={14} />
          ))}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      <Navbar
        right={
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setShowFeedback(true)}
              className="p-2 rounded-full text-muted hover:text-text hover:bg-surface-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title="Share feedback"
            >
              <ChatTeardropTextIcon size={18} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted hover:text-text hover:bg-surface-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>
            <span className="text-xs text-muted hidden sm:block">
              {userEmail}
            </span>
            {isPro && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-muted text-accent">
                Pro
              </span>
            )}
            <Link
              href="/auth"
              className="text-xs text-muted hover:text-text transition-colors duration-150"
            >
              Sign out
            </Link>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-semibold text-text">My Resumes</h1>
            <p className="text-sm text-muted mt-0.5">
              {isPro
                ? 'Unlimited variants'
                : `${variants.length} / ${LIMITS.FREE_VARIANTS} free variants`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {atLimit && (
              <Link
                href="/pricing"
                className="text-xs text-accent hover:underline"
              >
                Upgrade for unlimited
              </Link>
            )}
            <button
              onClick={handleNewResume}
              disabled={atLimit || creating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-accent-text text-sm rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {creating ? (
                <>
                  <SpinnerGapIcon
                    size={16}
                    weight="bold"
                    className="animate-spin"
                  />
                  Creating…
                </>
              ) : (
                <>
                  <PlusIcon size={16} weight="bold" />
                  New Resume
                </>
              )}
            </button>
          </div>
        </div>

        {/* Free tier upgrade nudge */}
        {atLimit && variants.length > 0 && (
          <div className="mb-6 p-4 bg-accent-muted border border-accent/20 rounded-xl text-sm text-text">
            <span className="font-medium">Free plan limit reached.</span>{' '}
            <Link href="/pricing" className="text-accent hover:underline">
              Upgrade to Pro
            </Link>{' '}
            for unlimited resume variants.
          </div>
        )}

        {variants.length === 0 ? (
          /* Enhanced Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-surface-2 flex items-center justify-center">
                <span className="text-4xl">📄</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <PlusIcon
                  size={16}
                  weight="bold"
                  className="text-accent-text"
                />
              </div>
            </div>

            <h2 className="text-lg font-semibold text-text mb-2">
              No resumes yet
            </h2>
            <p className="text-sm text-muted mb-8 max-w-sm">
              Create your first resume to get started. Choose a template below
              or start blank.
            </p>

            {/* Template Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full max-w-3xl mb-8">
              {TEMPLATE_PREVIEWS.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    if (!atLimit) handleNewResumeWithTemplate(template.id);
                  }}
                  disabled={atLimit}
                  className="flex flex-col items-center p-4 bg-surface border border-border rounded-xl hover:border-accent hover:bg-surface-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <div
                    className="w-12 h-16 rounded-md mb-3 flex items-center justify-center text-lg font-medium"
                    style={{
                      backgroundColor: TEMPLATE_INFO[template.id]?.color + '20',
                      color: TEMPLATE_INFO[template.id]?.color,
                    }}
                  >
                    {template.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-text">
                    {template.name}
                  </span>
                  <span className="text-xs text-muted mt-0.5">
                    {template.description}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleNewResume}
              disabled={creating || atLimit}
              className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-accent-text text-sm font-medium rounded-lg transition-colors duration-150 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {creating ? 'Creating…' : 'Start with Blank Resume'}
            </button>
          </div>
        ) : (
          <>
            {/* Search and Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  placeholder="Search resumes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-2 px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text hover:bg-surface-2 transition-colors h-full"
                  >
                    <FunnelIcon size={16} />
                    <span className="hidden sm:inline">
                      {sortBy === 'updatedAt'
                        ? 'Modified'
                        : sortBy === 'title'
                          ? 'Title'
                          : 'Template'}
                    </span>
                    {sortDirection === 'asc' ? (
                      <ArrowUpIcon size={14} />
                    ) : (
                      <ArrowDownIcon size={14} />
                    )}
                  </button>
                  {showSortMenu && <SortMenu />}
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-surface border border-border rounded-lg p-1 h-full">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-accent text-accent-text' : 'text-muted hover:text-text'}`}
                    title="Grid view"
                  >
                    <SquaresFourIcon size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-accent text-accent-text' : 'text-muted hover:text-text'}`}
                    title="List view"
                  >
                    <ListIcon size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* No results message */}
            {filteredVariants.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <p className="text-muted">
                  No resumes found matching &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-accent hover:underline mt-2"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Variants Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVariants.map((variant, index) => (
                  <VariantCard
                    key={variant.id}
                    variant={variant}
                    index={index}
                    viewMode="grid"
                    clonedFromTitle={
                      variant.clonedFromId
                        ? (variants.find((v) => v.id === variant.clonedFromId)
                            ?.title ?? null)
                        : null
                    }
                    isDeleting={deletingId === variant.id}
                    onDelete={() => handleDelete(variant.id)}
                    onClone={() => setCloneSource(variant)}
                    onOpen={() => router.push(`/editor/${variant.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredVariants.map((variant, index) => (
                  <VariantCard
                    key={variant.id}
                    variant={variant}
                    index={index}
                    viewMode="list"
                    clonedFromTitle={
                      variant.clonedFromId
                        ? (variants.find((v) => v.id === variant.clonedFromId)
                            ?.title ?? null)
                        : null
                    }
                    isDeleting={deletingId === variant.id}
                    onDelete={() => handleDelete(variant.id)}
                    onClone={() => setCloneSource(variant)}
                    onOpen={() => router.push(`/editor/${variant.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Clone modal */}
      {cloneSource && (
        <CloneModal
          sourceVariant={cloneSource}
          loading={cloning}
          onConfirm={handleCloneConfirm}
          onClose={() => {
            if (!cloning) setCloneSource(null);
          }}
        />
      )}

      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  );

  async function handleNewResumeWithTemplate(templateId: string) {
    setCreating(true);
    try {
      const res = await fetch('/api/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'My Resume',
          rawContent: TEMPLATE_CONTENT[templateId] || TEMPLATE_CONTENT.minimal,
          templateId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create variant');
      router.push(`/editor/${data.data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create resume');
      setCreating(false);
    }
  }
}

const RESUME_NATURAL_WIDTH = 595;

function ResumeThumbnail({
  variant,
  templateInfo,
}: {
  variant: ResumeVariant;
  templateInfo: { name: string; color: string };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const parsedResume = useMemo(() => {
    try {
      return parseResume(variant.rawContent);
    } catch {
      return null;
    }
  }, [variant.rawContent]);

  const templateDef = getTemplate(variant.templateId);
  const TemplateComponent = templateDef?.component;

  const scale = containerWidth > 0 ? containerWidth / RESUME_NATURAL_WIDTH : 0;

  const fallback = (
    <div
      className="w-full h-full flex items-center justify-center text-3xl font-bold"
      style={{ color: templateInfo.color }}
    >
      {variant.title.charAt(0).toUpperCase() || 'R'}
    </div>
  );

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      {scale > 0 && parsedResume && TemplateComponent ? (
        <Suspense fallback={fallback}>
          <div
            style={{
              width: RESUME_NATURAL_WIDTH,
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
              pointerEvents: 'none',
            }}
          >
            <TemplateComponent resume={parsedResume} />
          </div>
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}

function VariantCard({
  variant,
  index,
  viewMode,
  clonedFromTitle,
  isDeleting,
  onDelete,
  onClone,
  onOpen,
}: {
  variant: ResumeVariant;
  index: number;
  viewMode: 'grid' | 'list';
  clonedFromTitle?: string | null;
  isDeleting: boolean;
  onDelete: () => void;
  onClone: () => void;
  onOpen: () => void;
}) {
  const updatedAt = new Date(variant.updatedAt);
  const relativeDate = formatRelative(updatedAt);
  const templateInfo = TEMPLATE_INFO[variant.templateId] || {
    name: variant.templateId,
    color: 'var(--color-template-minimal)',
  };

  if (viewMode === 'grid') {
    return (
      <div
        onClick={onOpen}
        className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-border-strong transition-all duration-200 cursor-pointer card-lift"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Preview Thumbnail */}
        <div className="h-40 bg-white relative overflow-hidden">
          <ResumeThumbnail variant={variant} templateInfo={templateInfo} />
          <div className="absolute top-2 right-2">
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: templateInfo.color + '20',
                color: templateInfo.color,
              }}
            >
              {templateInfo.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm font-medium text-text truncate">
            {variant.title}
          </p>
          <p className="text-xs text-muted mt-1">Updated {relativeDate}</p>

          {clonedFromTitle && (
            <p className="text-xs text-muted mt-1 flex items-center gap-1">
              <CopySimpleIcon size={11} />
              Cloned from{' '}
              <span className="text-text font-medium">{clonedFromTitle}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
            <Link
              href={`/editor/${variant.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1 p-1.5 text-xs text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors"
              title="Edit"
            >
              <PencilSimpleIcon size={14} />
              Edit
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClone();
              }}
              className="flex-1 flex items-center justify-center gap-1 p-1.5 text-xs text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors"
              title="Clone variant"
            >
              <CopySimpleIcon size={14} />
              Clone
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-1 p-1.5 text-xs text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors disabled:opacity-40"
              title="Delete"
            >
              {isDeleting ? (
                <SpinnerGapIcon
                  size={14}
                  weight="bold"
                  className="animate-spin"
                />
              ) : (
                <TrashIcon size={14} />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      onClick={onOpen}
      className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 hover:border-border-strong transition-colors duration-150 cursor-pointer group"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Thumbnail */}
      <div
        className="w-12 h-14 rounded-md flex-shrink-0 flex items-center justify-center text-lg font-bold"
        style={{
          backgroundColor: 'var(--color-surface-2)',
          color: templateInfo.color,
        }}
      >
        {variant.title.charAt(0).toUpperCase() || 'R'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-text truncate">
            {variant.title}
          </p>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0"
            style={{
              backgroundColor: templateInfo.color + '20',
              color: templateInfo.color,
            }}
          >
            {templateInfo.name}
          </span>
        </div>
        <p className="text-xs text-muted mt-0.5">Updated {relativeDate}</p>
        {clonedFromTitle && (
          <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
            <CopySimpleIcon size={11} />
            Cloned from{' '}
            <span className="text-text font-medium">{clonedFromTitle}</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          href={`/editor/${variant.id}`}
          onClick={(e) => e.stopPropagation()}
          className="p-2 text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Edit"
        >
          <PencilSimpleIcon size={16} />
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClone();
          }}
          className="p-2 text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Clone variant"
        >
          <CopySimpleIcon size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          className="p-2 text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors duration-150 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Delete"
        >
          {isDeleting ? (
            <SpinnerGapIcon size={16} weight="bold" className="animate-spin" />
          ) : (
            <TrashIcon size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

function formatRelative(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
