'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  SpinnerGapIcon,
  KeyIcon,
  CheckCircleIcon,
  CopySimpleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@phosphor-icons/react';
import { PRESET_PROVIDERS } from '@/lib/ai-providers/presets';
import type { AdapterType } from '@/lib/db/interfaces';

interface UserProvider {
  id: string;
  name: string;
  adapterType: AdapterType;
  baseUrl: string;
  keyPreview: string;
  createdAt: string;
}

interface McpKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface SettingsClientProps {
  userEmail: string;
  userId: string;
  memberSince: string;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Add Provider Form
// ---------------------------------------------------------------------------

interface AddFormState {
  name: string;
  adapterType: AdapterType;
  baseUrl: string;
  key: string;
  baseUrlLocked: boolean;
  adapterLocked: boolean;
}

const EMPTY_FORM: AddFormState = {
  name: '',
  adapterType: 'openai',
  baseUrl: '',
  key: '',
  baseUrlLocked: false,
  adapterLocked: false,
};

// ---------------------------------------------------------------------------
// Provider badge colors
// ---------------------------------------------------------------------------

const PROVIDER_COLORS: Record<string, string> = {
  openai: 'text-green-400 bg-green-400/10',
  anthropic: 'text-amber-400 bg-amber-400/10',
  'google gemini': 'text-blue-400 bg-blue-400/10',
};

function providerBadgeClass(name: string): string {
  return PROVIDER_COLORS[name.toLowerCase()] ?? 'text-muted bg-surface-2';
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SettingsClient({
  userEmail,
  memberSince,
}: SettingsClientProps) {
  // Providers state
  const [providers, setProviders] = useState<UserProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<AddFormState>(EMPTY_FORM);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [providerError, setProviderError] = useState('');

  // MCP Keys state
  const [mcpKeys, setMcpKeys] = useState<McpKey[]>([]);
  const [mcpLoading, setMcpLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  useEffect(() => {
    fetch('/api/user/providers')
      .then((r) => r.json())
      .then((d) => setProviders(d.providers ?? []))
      .catch(() => {})
      .finally(() => setProvidersLoading(false));

    fetch('/api/auth/local/mcp-keys')
      .then((r) => r.json())
      .then((d) => setMcpKeys(d.data ?? []))
      .catch(() => {})
      .finally(() => setMcpLoading(false));
  }, []);

  // Preset quick-add
  const handlePresetAdd = (preset: keyof typeof PRESET_PROVIDERS) => {
    const p = PRESET_PROVIDERS[preset];
    setForm({
      name: p.name,
      adapterType: p.adapterType,
      baseUrl: p.baseUrl,
      key: '',
      baseUrlLocked: true,
      adapterLocked: true,
    });
    setShowAddForm(true);
    setProviderError('');
  };

  const isPresetConnected = (preset: keyof typeof PRESET_PROVIDERS) => {
    const p = PRESET_PROVIDERS[preset];
    return providers.some((prov) => prov.baseUrl === p.baseUrl);
  };

  const handleSaveProvider = async () => {
    if (!form.name || !form.baseUrl || !form.key) {
      setProviderError('All fields are required.');
      return;
    }
    setSaving(true);
    setProviderError('');
    try {
      const res = await fetch('/api/user/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          adapterType: form.adapterType,
          baseUrl: form.baseUrl.replace(/\/$/, ''),
          key: form.key,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProviderError(data.error ?? 'Failed to save provider');
        return;
      }
      if (data.provider) setProviders((prev) => [data.provider, ...prev]);
      setForm(EMPTY_FORM);
      setShowAddForm(false);
    } catch {
      setProviderError('Failed to save provider');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProvider = async (id: string) => {
    setRemovingId(id);
    try {
      await fetch(`/api/user/providers/${id}`, { method: 'DELETE' });
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // silent
    } finally {
      setRemovingId(null);
    }
  };

  // MCP key handlers
  const handleCreateMcpKey = async () => {
    if (!newKeyName.trim() || creatingKey) return;
    setCreatingKey(true);
    try {
      const res = await fetch('/api/auth/local/mcp-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMcpKeys((prev) => [
        {
          id: data.data.id,
          name: data.data.name,
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
        },
        ...prev,
      ]);
      setNewRawKey(data.data.key);
      setNewKeyName('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeMcpKey = async (id: string) => {
    setRevokingId(id);
    try {
      await fetch(`/api/auth/local/mcp-keys/${id}`, { method: 'DELETE' });
      setMcpKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      alert('Failed to revoke key');
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyKey = () => {
    if (!newRawKey) return;
    navigator.clipboard.writeText(newRawKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-bg">
      {/* Nav */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-text">Settings</span>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors"
          >
            <ArrowLeftIcon size={14} />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* ------------------------------------------------------------------ */}
        {/* Section 1 — Account */}
        {/* ------------------------------------------------------------------ */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Email</span>
              <span className="text-sm text-text">{userEmail || '—'}</span>
            </div>
            {memberSince && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Member since</span>
                <span className="text-sm text-text">
                  {formatDate(memberSince)}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Section 2 — AI Providers */}
        {/* ------------------------------------------------------------------ */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-text">AI Providers</h2>

          {/* Preset quick-add cards */}
          <div>
            <p className="text-xs text-muted mb-3">Quick add</p>
            <div className="grid grid-cols-3 gap-3">
              {(
                Object.keys(
                  PRESET_PROVIDERS
                ) as (keyof typeof PRESET_PROVIDERS)[]
              ).map((key) => {
                const preset = PRESET_PROVIDERS[key];
                const connected = isPresetConnected(key);
                return (
                  <div
                    key={key}
                    className="flex flex-col items-center gap-2 p-3 bg-surface-2 border border-border rounded-xl"
                  >
                    <span className="text-xs font-medium text-text text-center leading-tight">
                      {preset.name}
                    </span>
                    {connected ? (
                      <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePresetAdd(key)}
                        className="text-[10px] px-2.5 py-1 bg-accent text-accent-text rounded-full hover:opacity-90 transition-opacity"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provider list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted">Your providers</p>
              {!showAddForm && (
                <button
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setShowAddForm(true);
                    setProviderError('');
                  }}
                  className="flex items-center gap-1 text-xs text-accent hover:opacity-80 transition-opacity"
                >
                  <PlusIcon size={12} weight="bold" />
                  Add custom
                </button>
              )}
            </div>

            {providersLoading ? (
              <div className="flex justify-center py-4">
                <SpinnerGapIcon size={18} className="animate-spin text-muted" />
              </div>
            ) : providers.length === 0 && !showAddForm ? (
              <p className="text-xs text-faint text-center py-4">
                No providers yet — add one above
              </p>
            ) : (
              <div className="space-y-2">
                {providers.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 bg-surface-2 border border-border rounded-lg"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 ${providerBadgeClass(p.name)}`}
                      >
                        {p.adapterType}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-text truncate">{p.name}</p>
                        <p className="text-[11px] text-faint truncate">
                          {new URL(p.baseUrl).hostname} · {p.keyPreview}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProvider(p.id)}
                      disabled={removingId === p.id}
                      className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors flex-shrink-0"
                      title="Remove provider"
                    >
                      {removingId === p.id ? (
                        <SpinnerGapIcon size={13} className="animate-spin" />
                      ) : (
                        <TrashIcon size={13} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add provider form */}
          {showAddForm && (
            <div className="border border-border rounded-xl p-4 space-y-3 bg-surface-2">
              <p className="text-xs font-medium text-text">Add provider</p>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Name (e.g. My OpenAI)"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text placeholder:text-faint outline-none focus:border-accent transition-colors"
                />

                <div className="flex gap-2">
                  <select
                    value={form.adapterType}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        adapterType: e.target.value as AdapterType,
                      }))
                    }
                    disabled={form.adapterLocked}
                    className="flex-1 text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text outline-none focus:border-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="openai">OpenAI-compatible</option>
                    <option value="anthropic">Anthropic-compatible</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Base URL (e.g. https://api.openai.com/v1)"
                  value={form.baseUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, baseUrl: e.target.value }))
                  }
                  readOnly={form.baseUrlLocked}
                  className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text placeholder:text-faint outline-none focus:border-accent transition-colors read-only:opacity-60 read-only:cursor-default"
                />

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder="API Key"
                    value={form.key}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, key: e.target.value }))
                    }
                    className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 pr-9 text-text placeholder:text-faint outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-muted transition-colors"
                  >
                    {showKey ? (
                      <EyeSlashIcon size={14} />
                    ) : (
                      <EyeIcon size={14} />
                    )}
                  </button>
                </div>
              </div>

              {providerError && (
                <p className="text-xs text-danger">{providerError}</p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSaveProvider}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs bg-accent text-accent-text rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && (
                    <SpinnerGapIcon size={12} className="animate-spin" />
                  )}
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setForm(EMPTY_FORM);
                    setProviderError('');
                  }}
                  className="px-4 py-2 text-xs text-muted hover:text-text bg-surface hover:bg-surface-2 border border-border rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Section 3 — MCP Keys */}
        {/* ------------------------------------------------------------------ */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <KeyIcon size={15} className="text-muted" />
            <h2 className="text-sm font-semibold text-text">MCP Keys</h2>
          </div>

          {/* New key banner */}
          {newRawKey && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium text-accent flex items-center gap-1.5">
                <CheckCircleIcon size={14} weight="fill" />
                Key created — copy it now, it won&apos;t be shown again
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] font-mono text-text bg-surface border border-border rounded px-3 py-2 truncate">
                  {newRawKey}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-accent text-accent-text rounded-lg hover:bg-accent-hover transition-colors flex-shrink-0"
                >
                  {keyCopied ? (
                    <CheckCircleIcon size={13} weight="fill" />
                  ) : (
                    <CopySimpleIcon size={13} />
                  )}
                  {keyCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Create key */}
          <div>
            <p className="text-xs text-muted mb-2">Create a new key</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Key name (e.g. Claude Desktop)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateMcpKey()}
                maxLength={64}
                className="flex-1 text-sm bg-surface-2 border border-border rounded-lg px-3 py-2 text-text placeholder:text-faint outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={handleCreateMcpKey}
                disabled={!newKeyName.trim() || creatingKey}
                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-accent text-accent-text rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {creatingKey ? (
                  <SpinnerGapIcon size={13} className="animate-spin" />
                ) : (
                  <PlusIcon size={13} weight="bold" />
                )}
                Generate
              </button>
            </div>
          </div>

          {/* Key list */}
          <div>
            <p className="text-xs text-muted mb-2">Active keys</p>
            {mcpLoading ? (
              <div className="flex justify-center py-4">
                <SpinnerGapIcon size={18} className="animate-spin text-muted" />
              </div>
            ) : mcpKeys.length === 0 ? (
              <p className="text-xs text-faint text-center py-4">No keys yet</p>
            ) : (
              <div className="space-y-2">
                {mcpKeys.map((key) => (
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
                      onClick={() => handleRevokeMcpKey(key.id)}
                      disabled={revokingId === key.id}
                      className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors flex-shrink-0"
                      title="Revoke key"
                    >
                      {revokingId === key.id ? (
                        <SpinnerGapIcon size={13} className="animate-spin" />
                      ) : (
                        <TrashIcon size={13} />
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
            in API calls.
          </p>
        </section>
      </div>
    </main>
  );
}
