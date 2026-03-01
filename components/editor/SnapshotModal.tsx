'use client';

import { useState } from 'react';

interface SnapshotModalProps {
  variantId: string;
  rawContent: string;
  templateId: string;
  onClose: () => void;
  onSaved: () => void;
}

const SUGGESTIONS = [
  'Updated experience',
  'Tailored for [Company]',
  'Added new project',
];

export default function SnapshotModal({
  variantId,
  rawContent,
  templateId,
  onClose,
  onSaved,
}: SnapshotModalProps) {
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!message.trim() || saving) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/variants/${variantId}/snapshots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent,
          message: message.trim(),
          templateId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to save snapshot');
      }

      setSaved(true);
      setTimeout(() => onSaved(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
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
        <h2 className="text-sm font-semibold text-text mb-4">Save snapshot</h2>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
          placeholder="Describe this version…"
          autoFocus
          className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent transition-colors duration-150"
        />

        <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setMessage(s)}
              className="text-xs text-muted border border-border rounded-full px-2.5 py-1 hover:bg-surface-2 transition-colors duration-150"
            >
              {s}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-danger mb-3">{error}</p>}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border border-border rounded-lg text-muted hover:bg-surface-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!message.trim() || saving || saved}
            className="px-3 py-1.5 text-sm bg-accent text-accent-text rounded-lg hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
