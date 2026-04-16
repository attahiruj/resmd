'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadSimpleIcon,
  FileIcon,
  XIcon,
  SpinnerGapIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { LIMITS } from '@/lib/limits';

interface ImportModalProps {
  atLimit: boolean;
  onClose: () => void;
}

export default function ImportModal({ atLimit, onClose }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (selectedFile: File) => {
    if (atLimit) return;

    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 5MB limit');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('File type not supported. Allowed: .pdf, .docx, .txt, .md');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to import file');
      }

      setPreview(data.rawContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleCreateResume = async () => {
    if (!preview) return;

    setSaving(true);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file?.name.replace(/\.[^/.]+$/, '') || 'Imported Resume',
          rawContent: preview,
          templateId: 'minimal',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create resume');
      onClose();
      router.push(`/editor/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resume');
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modal-in 150ms ease-out' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">Import Resume</h2>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {atLimit ? (
            <div className="text-center py-8">
              <p className="text-sm text-danger mb-2">
                You&apos;ve reached the maximum of {LIMITS.MAX_VARIANTS}{' '}
                resumes.
              </p>
              <p className="text-xs text-muted">
                Delete one to import a new resume.
              </p>
            </div>
          ) : !preview ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                error
                  ? 'border-danger/50 bg-danger/5'
                  : 'border-border hover:border-accent/50 hover:bg-surface-2'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
              />

              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <SpinnerGapIcon
                    size={32}
                    className="text-accent animate-spin"
                  />
                  <p className="text-sm text-muted">Extracting text...</p>
                </div>
              ) : (
                <>
                  <UploadSimpleIcon
                    size={48}
                    className="mx-auto text-muted mb-3"
                  />
                  <p className="text-sm text-text mb-1">
                    Drag and drop your resume here
                  </p>
                  <p className="text-xs text-muted mb-4">
                    or click to browse (PDF, DOCX, TXT, MD - max 5MB)
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                <FileIcon size={24} className="text-accent" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {file?.name}
                  </p>
                  <p className="text-xs text-muted">Ready to import</p>
                </div>
                <button
                  onClick={handleReset}
                  className="p-1.5 text-muted hover:text-text hover:bg-surface rounded-lg transition-colors"
                >
                  <XIcon size={16} />
                </button>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-surface-2 px-3 py-2 border-b border-border">
                  <p className="text-xs text-muted">ResMarkup Preview</p>
                </div>
                <pre className="p-4 text-xs text-text overflow-auto max-h-64 font-mono whitespace-pre-wrap bg-bg">
                  {preview}
                </pre>
              </div>

              <p className="text-xs text-muted flex items-start gap-2">
                <WarningIcon className="text-warning w-4 h-4" />
                Best-effort conversion — review and edit before saving.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-xs text-danger">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 p-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateResume} disabled={!preview || saving}>
            {saving && (
              <SpinnerGapIcon
                size={14}
                weight="bold"
                className="animate-spin mr-2"
              />
            )}
            {saving ? 'Creating...' : 'Create Resume'}
          </Button>
        </div>
      </div>
    </div>
  );
}
