'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon, TrashIcon, SpinnerGapIcon } from '@phosphor-icons/react'
import type { ResumeVariant } from '@/types/resume'
import { LIMITS } from '@/lib/limits'

interface DashboardClientProps {
  initialVariants: ResumeVariant[]
  isPro: boolean
  userEmail: string
}

export default function DashboardClient({
  initialVariants,
  isPro,
  userEmail,
}: DashboardClientProps) {
  const [variants, setVariants] = useState(initialVariants)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const atLimit = !isPro && variants.length >= LIMITS.FREE_VARIANTS

  const handleNewResume = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'My Resume', rawContent: '', templateId: 'minimal' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create variant')
      router.push(`/editor/${data.data.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create resume')
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume variant? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/variants/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setVariants((prev) => prev.filter((v) => v.id !== id))
    } catch {
      alert('Failed to delete variant')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top nav */}
      <div className="h-[52px] border-b border-border bg-surface flex items-center px-6 gap-4">
        <span className="text-sm font-semibold text-text">resmd</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted hidden sm:block">{userEmail}</span>
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
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-semibold text-text">My Resumes</h1>
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
                  <SpinnerGapIcon size={14} weight="bold" className="animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <PlusIcon size={14} weight="bold" />
                  New Resume
                </>
              )}
            </button>
          </div>
        </div>

        {/* Variants list */}
        {variants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-[64px] text-faint mb-4 select-none">📄</div>
            <h2 className="text-base font-medium text-text mb-1">No resumes yet</h2>
            <p className="text-sm text-muted mb-6">Create your first resume to get started</p>
            <button
              onClick={handleNewResume}
              disabled={creating}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-accent-text text-sm rounded-lg transition-colors duration-150 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {creating ? 'Creating…' : 'Get Started'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {variants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                isDeleting={deletingId === variant.id}
                onDelete={() => handleDelete(variant.id)}
              />
            ))}
          </div>
        )}

        {/* Free tier upgrade nudge */}
        {atLimit && (
          <div className="mt-6 p-4 bg-accent-muted border border-accent/20 rounded-xl text-sm text-text">
            <span className="font-medium">Free plan limit reached.</span>{' '}
            <Link href="/pricing" className="text-accent hover:underline">
              Upgrade to Pro
            </Link>{' '}
            for unlimited resume variants.
          </div>
        )}
      </div>
    </div>
  )
}

function VariantCard({
  variant,
  isDeleting,
  onDelete,
}: {
  variant: ResumeVariant
  isDeleting: boolean
  onDelete: () => void
}) {
  const updatedAt = new Date(variant.updatedAt)
  const relativeDate = formatRelative(updatedAt)

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 hover:border-border-strong transition-colors duration-150">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{variant.title}</p>
        <p className="text-xs text-muted mt-0.5">
          {capitalize(variant.templateId)} template · Updated {relativeDate}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/editor/${variant.id}`}
          className="px-3 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover text-accent-text rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Edit
        </Link>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-1.5 text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors duration-150 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Delete"
        >
          {isDeleting ? <SpinnerGapIcon size={14} weight="bold" className="animate-spin" /> : <TrashIcon size={14} />}
        </button>
      </div>
    </div>
  )
}

function formatRelative(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

