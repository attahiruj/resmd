'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash,
  CopySimple,
  SpinnerGap,
  Key,
  CheckCircle,
} from '@phosphor-icons/react';

interface McpKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface McpKeysModalProps {
  onClose: () => void;
}

export default function McpKeysModal({ onClose }: McpKeysModalProps) {
  const [keys, setKeys] = useState<McpKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/auth/local/mcp-keys')
      .then((r) => r.json())
      .then((d) => setKeys(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newKeyName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/auth/local/mcp-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKeys((prev) => [
        {
          id: data.data.id,
          name: data.data.name,
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
        },
        ...prev,
      ]);
      setNewKey(data.data.key);
      setNewKeyName('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await fetch(`/api/auth/local/mcp-keys/${id}`, { method: 'DELETE' });
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      alert('Failed to revoke key');
    } finally {
      setRevoking(null);
    }
  };

  const handleCopy = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-muted" />
            <h2 className="text-sm font-semibold text-text">MCP Keys</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-faint hover:text-text hover:bg-surface-2 transition-colors duration-150 -mr-1"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* New key created banner */}
          {newKey && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium text-accent flex items-center gap-1.5">
                <CheckCircle size={14} weight="fill" />
                Key created — copy it now, it won&apos;t be shown again
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] font-mono text-text bg-surface border border-border rounded px-3 py-2 truncate">
                  {newKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-accent text-accent-text rounded-lg hover:bg-accent-hover transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle size={13} weight="fill" />
                  ) : (
                    <CopySimple size={13} />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Create new key */}
          <div>
            <p className="text-xs text-muted mb-2">Create a new key</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Key name (e.g. Claude Desktop)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                maxLength={64}
                className="flex-1 text-sm bg-surface-2 border border-border rounded-lg px-3 py-2 text-text placeholder:text-faint outline-none focus:border-accent transition-colors duration-150"
              />
              <button
                onClick={handleCreate}
                disabled={!newKeyName.trim() || creating}
                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-accent text-accent-text rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {creating ? (
                  <SpinnerGap
                    size={13}
                    weight="bold"
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={13} weight="bold" />
                )}
                Generate
              </button>
            </div>
          </div>

          {/* Key list */}
          <div>
            <p className="text-xs text-muted mb-2">Active keys</p>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <SpinnerGap size={20} className="animate-spin text-muted" />
              </div>
            ) : keys.length === 0 ? (
              <p className="text-xs text-faint text-center py-6">No keys yet</p>
            ) : (
              <div className="space-y-2">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 bg-surface-2 border border-border rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-text truncate">{key.name}</p>
                      <p className="text-[11px] text-muted mt-0.5">
                        Created {formatDate(key.createdAt)}
                        {key.lastUsedAt &&
                          ` · Last used ${formatDate(key.lastUsedAt)}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevoke(key.id)}
                      disabled={revoking === key.id}
                      className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors flex-shrink-0"
                      title="Revoke key"
                    >
                      {revoking === key.id ? (
                        <SpinnerGap
                          size={14}
                          weight="bold"
                          className="animate-spin"
                        />
                      ) : (
                        <Trash size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-faint">
            Keys authenticate MCP server requests. Use{' '}
            <code className="bg-surface-2 px-1 rounded">
              Authorization: Bearer &lt;key&gt;
            </code>{' '}
            in API calls. See{' '}
            <a
              href="https://github.com/attahiruj/resmd-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              resmd-mcp
            </a>{' '}
            for setup.
          </p>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
