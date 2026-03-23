'use client';

import { useState } from 'react';
import { SpinnerGapIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import type { Resume } from '@/types/resume';
import { LIMITS } from '@/lib/limits';

const SUGGESTED_NAMES = [
  'Software Engineering CV',
  'Java Developer',
  'Senior Role',
  'Freelance Portfolio',
];

interface CloneModalProps {
  sourceResume: Resume;
  onConfirm: (title: string) => void;
  onClose: () => void;
  loading?: boolean;
  atLimit?: boolean;
}

export default function CloneModal({
  sourceResume,
  onConfirm,
  onClose,
  loading = false,
  atLimit = false,
}: CloneModalProps) {
  const [title, setTitle] = useState('');

  const handleConfirm = () => {
    if (!title.trim() || loading) return;
    onConfirm(title.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-xl shadow-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modal-in 150ms ease-out' }}
      >
        <h2 className="text-sm font-semibold text-text mb-1">Clone resume</h2>
        {atLimit && (
          <p className="text-xs text-danger mb-4">
            You&aposve reached the maximum of {LIMITS.MAX_VARIANTS} resumes.
            Delete one to clone this variant.
          </p>
        )}
        {!atLimit && (
          <p className="text-xs text-muted mb-4">
            Cloning from:{' '}
            <span className="text-text font-medium">{sourceResume.title}</span>
          </p>
        )}

        <label className="text-xs text-muted block mb-1">
          Name your new variant
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
          }}
          placeholder="e.g. Tailored for Google"
          autoFocus
          className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent transition-colors duration-150"
        />

        <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
          {SUGGESTED_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => setTitle(name)}
              className="text-xs text-muted border border-border rounded-full px-2.5 py-1 hover:bg-surface-2 transition-colors duration-150"
            >
              {name}
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!title.trim() || loading}>
            {loading && (
              <SpinnerGapIcon
                size={14}
                weight="bold"
                className="animate-spin"
              />
            )}
            {loading ? 'Cloning…' : 'Clone resume'}
          </Button>
        </div>
      </div>
    </div>
  );
}
