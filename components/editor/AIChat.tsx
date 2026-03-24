'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowCounterClockwiseIcon,
  BrainIcon,
  CaretDownIcon,
  CaretUpIcon,
  CheckIcon,
  CopyIcon,
  EraserIcon,
  PaperPlaneTiltIcon,
  XIcon,
} from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import { parseSuggestion } from '@/lib/prompts';
import { AI_MODEL_STORAGE_KEY } from '@/lib/ai';

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  use_count?: number;
}

const PROVIDER_COLORS: Record<string, string> = {
  openrouter: 'text-purple-400 bg-purple-400/10',
  groq: 'text-orange-400 bg-orange-400/10',
  minimax: 'text-teal-400 bg-teal-400/10',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EditStatus = 'pending' | 'applied' | 'dismissed';

interface Edit {
  search: string;
  replace: string;
  status: EditStatus;
}

interface Message {
  role: 'user' | 'assistant';
  prose: string;
  edits: Edit[];
  fullResume?: string;
  model?: string; // model that generated this message (for tracking)
}

interface AIChatProps {
  resumeContent: string;
  onApplyEdit?: (search: string, replace: string) => void;
  onReplaceResume?: (content: string) => void;
  isGuest?: boolean;
  expanded?: boolean;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AIChat({
  resumeContent,
  onApplyEdit,
  onReplaceResume,
  isGuest = false,
  expanded = false,
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);

  // Load persisted model selection and fetch available models
  useEffect(() => {
    const saved = localStorage.getItem(AI_MODEL_STORAGE_KEY);
    if (saved) setSelectedModel(saved);

    fetch('/api/ai/models')
      .then((r) => r.json())
      .then((data) => {
        if (data.models?.length) {
          setModels(data.models);
          // If no saved model, default to the first one
          if (!saved) {
            setSelectedModel(data.models[0].id);
            localStorage.setItem(AI_MODEL_STORAGE_KEY, data.models[0].id);
          }
        }
      })
      .catch(() => {
        // Silently fail — server env model will be used as fallback
      });
  }, []);

  // Close model picker on outside click
  useEffect(() => {
    if (!showModelPicker) return;
    const handler = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        pickerTriggerRef.current &&
        !pickerTriggerRef.current.contains(e.target as Node)
      ) {
        setShowModelPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showModelPicker]);

  const handleModelChange = (id: string) => {
    setSelectedModel(id);
    localStorage.setItem(AI_MODEL_STORAGE_KEY, id);
    setShowModelPicker(false);
  };

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input after AI finishes responding
  const prevLoadingRef = useRef(false);
  useEffect(() => {
    if (prevLoadingRef.current && !loading) {
      inputRef.current?.focus();
    }
    prevLoadingRef.current = loading;
  }, [loading]);

  const updateEditStatus = (
    msgIdx: number,
    editIdx: number,
    status: EditStatus
  ) => {
    setMessages((prev) =>
      prev.map((m, mi) =>
        mi !== msgIdx
          ? m
          : {
              ...m,
              edits: m.edits.map((e, ei) =>
                ei === editIdx ? { ...e, status } : e
              ),
            }
      )
    );
  };

  // Fire-and-forget suggestion tracking
  const trackSuggestion = (
    action: 'accepted' | 'rejected',
    count: number,
    model?: string
  ) => {
    fetch('/api/ai/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, count, model }),
    }).catch(() => {});
  };

  const handleApply = (msgIdx: number, editIdx: number) => {
    const edit = messages[msgIdx]?.edits[editIdx];
    if (!edit || edit.status !== 'pending') return;
    onApplyEdit?.(edit.search, edit.replace);
    updateEditStatus(msgIdx, editIdx, 'applied');
    trackSuggestion('accepted', 1, messages[msgIdx]?.model);
  };

  const handleDismiss = (msgIdx: number, editIdx: number) => {
    if (messages[msgIdx]?.edits[editIdx]?.status !== 'pending') return;
    updateEditStatus(msgIdx, editIdx, 'dismissed');
    trackSuggestion('rejected', 1, messages[msgIdx]?.model);
  };

  const handleApplyAll = (msgIdx: number) => {
    const msg = messages[msgIdx];
    if (!msg) return;
    const pending = msg.edits.filter((e) => e.status === 'pending');
    pending.forEach((edit) => onApplyEdit?.(edit.search, edit.replace));
    setMessages((prev) =>
      prev.map((m, mi) =>
        mi !== msgIdx
          ? m
          : {
              ...m,
              edits: m.edits.map((e) =>
                e.status === 'pending'
                  ? { ...e, status: 'applied' as EditStatus }
                  : e
              ),
            }
      )
    );
    if (pending.length > 0)
      trackSuggestion('accepted', pending.length, msg.model);
  };

  const handleDismissAll = (msgIdx: number) => {
    const msg = messages[msgIdx];
    if (!msg) return;
    const pending = msg.edits.filter((e) => e.status === 'pending');
    setMessages((prev) =>
      prev.map((m, mi) =>
        mi !== msgIdx
          ? m
          : {
              ...m,
              edits: m.edits.map((e) =>
                e.status === 'pending'
                  ? { ...e, status: 'dismissed' as EditStatus }
                  : e
              ),
            }
      )
    );
    if (pending.length > 0)
      trackSuggestion('rejected', pending.length, msg.model);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const send = async (overrideText?: string, historyOverride?: Message[]) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const history = historyOverride ?? messages;
    const userMsg: Message = { role: 'user', prose: text, edits: [] };
    const next = [...history, userMsg];
    setMessages(next);
    if (!overrideText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          resumeContent,
          // Send only prose for history — the full resume is always in the preamble
          history: history.map((m) => ({ role: m.role, content: m.prose })),
          model: selectedModel || undefined,
        }),
      });

      if (res.status === 429) {
        const after = res.headers.get('Retry-After');
        setMessages([
          ...next,
          {
            role: 'assistant',
            prose: `Slow down — try again${after ? ` in ${after}s` : ' in a moment'}.`,
            edits: [],
          },
        ]);
        return;
      }

      const data = await res.json();
      if (data.reply) {
        const { prose, edits, fullResume } = parseSuggestion(data.reply);
        setMessages([
          ...next,
          {
            role: 'assistant',
            prose,
            edits: edits.map((e) => ({
              ...e,
              status: 'pending' as EditStatus,
            })),
            fullResume,
            model: selectedModel || undefined,
          },
        ]);
      } else {
        setMessages([
          ...next,
          {
            role: 'assistant',
            prose: 'Something went wrong. Please try another model.',
            edits: [],
          },
        ]);
      }
    } catch {
      setMessages([
        ...next,
        {
          role: 'assistant',
          prose: 'Failed to reach the AI. Check your connection.',
          edits: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleRetry = (msgIdx: number, text: string) => {
    send(text, messages.slice(0, msgIdx));
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const activeModel = models.find((m) => m.id === selectedModel);

  // Keep input focused whenever the user interacts with non-interactive chat areas
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button, input, textarea, a, select')) {
      inputRef.current?.focus();
    }
  };

  if (isGuest) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-border bg-editor-bg flex-shrink-0 text-xs">
        <span className="flex items-center gap-1.5 text-faint">
          <span className="text-accent">✦</span>
          AI Assistant
        </span>
        <span className="text-muted">
          <a
            href="/auth?signup=1"
            className="text-accent hover:underline font-medium"
          >
            Create a free account
          </a>{' '}
          to use AI features
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col border-t border-border bg-editor-bg ${expanded ? 'flex-1 min-h-0' : 'flex-shrink-0'}`}
      onClick={handleContainerClick}
    >
      {messages.length > 0 && (
        <div
          ref={historyRef}
          className={`overflow-y-auto overflow-x-hidden px-4 py-3 flex flex-col gap-3 ${expanded ? 'flex-1' : ''}`}
          style={expanded ? undefined : { maxHeight: '300px' }}
        >
          {messages.map((msg, mi) => (
            <div
              key={mi}
              className={`group flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.prose && (
                <div
                  className={`text-sm rounded-xl px-3 py-1.5 max-w-[90%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent text-accent-text whitespace-pre-wrap'
                      : 'bg-surface text-text border border-border'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.prose
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-1.5 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-text">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-muted">{children}</em>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-1.5 pl-4 flex flex-col gap-0.5 list-disc">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-1.5 pl-4 flex flex-col gap-0.5 list-decimal">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm">{children}</li>
                        ),
                        code: ({ children }) => (
                          <code className="font-mono text-xs bg-surface-2 px-1 py-0.5 rounded">
                            {children}
                          </code>
                        ),
                        h1: ({ children }) => (
                          <p className="font-semibold mb-1">{children}</p>
                        ),
                        h2: ({ children }) => (
                          <p className="font-semibold mb-1">{children}</p>
                        ),
                        h3: ({ children }) => (
                          <p className="font-medium mb-0.5">{children}</p>
                        ),
                      }}
                    >
                      {msg.prose}
                    </ReactMarkdown>
                  )}
                </div>
              )}

              {msg.fullResume && (
                <FullResumeCard
                  content={msg.fullResume}
                  onApply={() => onReplaceResume?.(msg.fullResume!)}
                />
              )}

              {msg.role === 'user' && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={() => handleCopy(msg.prose, mi)}
                    className="p-1 rounded text-faint hover:text-text hover:bg-surface-2 transition-colors duration-150"
                    title="Copy"
                  >
                    {copiedIdx === mi ? (
                      <CheckIcon size={11} weight="bold" />
                    ) : (
                      <CopyIcon size={11} />
                    )}
                  </button>
                  <button
                    onClick={() => handleRetry(mi, msg.prose)}
                    disabled={loading}
                    className="p-1 rounded text-faint hover:text-text hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                    title="Retry"
                  >
                    <ArrowCounterClockwiseIcon size={11} />
                  </button>
                </div>
              )}

              {msg.edits.map((edit, ei) =>
                edit.status === 'dismissed' ? null : (
                  <SuggestionCard
                    key={ei}
                    edit={edit}
                    onApply={() => handleApply(mi, ei)}
                    onDismiss={() => handleDismiss(mi, ei)}
                  />
                )
              )}

              {msg.edits.filter((e) => e.status === 'pending').length > 1 && (
                <div className="self-start flex items-center gap-2">
                  <button
                    onClick={() => handleApplyAll(mi)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent text-accent-text rounded-lg hover:opacity-90 transition-opacity duration-150"
                  >
                    <CheckIcon size={12} weight="bold" />
                    Apply all (
                    {msg.edits.filter((e) => e.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => handleDismissAll(mi)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-text bg-surface hover:bg-surface-2 border border-border rounded-lg transition-colors duration-150"
                  >
                    <XIcon size={12} />
                    Dismiss all
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex flex-col gap-0.5 items-start">
              <div className="text-sm rounded-xl px-3 py-1.5 bg-surface border border-border text-muted">
                <ThinkingDots />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 py-2.5 sm:py-2">
        <span
          className="text-accent select-none text-sm flex-shrink-0 pb-1"
          aria-hidden
        >
          ✦
        </span>

        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={
            messages.length === 0 ? 'Ask AI to improve your resume…' : ''
          }
          disabled={loading}
          className="flex-1 bg-transparent text-sm text-text placeholder:text-faint outline-none disabled:opacity-50 resize-none overflow-y-auto max-h-36 leading-5 pb-1"
        />

        {/* Bubbles + send — right side */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Model picker bubble */}
          <div className="relative">
            {showModelPicker && (
              <div
                ref={pickerRef}
                className="absolute bottom-full mb-1.5 right-0 w-56 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
                  {models.map((m) => {
                    const isActive = m.id === selectedModel;
                    const badgeClass =
                      PROVIDER_COLORS[m.provider] ?? 'text-muted bg-surface-2';
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleModelChange(m.id)}
                        className={`w-full text-left px-3 py-3 sm:py-2 text-xs transition-colors duration-100 ${
                          isActive
                            ? 'bg-accent-muted text-accent'
                            : 'text-text hover:bg-surface-2'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{m.name}</span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span
                              className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wide ${badgeClass}`}
                            >
                              {m.provider}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <button
              ref={pickerTriggerRef}
              onClick={() => setShowModelPicker((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-muted hover:text-text bg-surface hover:bg-surface-2 border border-border transition-colors duration-150"
              title="Select AI model"
            >
              <BrainIcon size={12} className="text-accent flex-shrink-0" />
              <span className="hidden sm:inline max-w-[80px] truncate">
                {activeModel?.name ?? '…'}
              </span>
              {activeModel && (
                <span
                  className={`hidden sm:inline text-[9px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wide ${PROVIDER_COLORS[activeModel.provider] ?? 'text-muted bg-surface-2'}`}
                >
                  {activeModel.provider}
                </span>
              )}
              {showModelPicker ? (
                <CaretUpIcon
                  size={9}
                  weight="bold"
                  className="hidden sm:inline flex-shrink-0 text-faint"
                />
              ) : (
                <CaretDownIcon
                  size={9}
                  weight="bold"
                  className="hidden sm:inline flex-shrink-0 text-faint"
                />
              )}
            </button>
          </div>

          {/* Clear bubble */}
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-muted hover:text-text bg-surface hover:bg-surface-2 border border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
              title="Clear chat"
            >
              <EraserIcon size={12} />
              Clear
            </button>
          )}

          {/* Send */}
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="p-1.5 rounded-full text-accent hover:bg-accent-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="Send (Enter)"
          >
            <PaperPlaneTiltIcon size={15} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full resume rewrite card
// ---------------------------------------------------------------------------

function FullResumeCard({
  content,
  onApply,
}: {
  content: string;
  onApply: () => void;
}) {
  const [applied, setApplied] = useState(false);
  const preview = content.split('\n').slice(0, 6).join('\n');

  const handleApply = () => {
    onApply();
    setApplied(true);
  };

  return (
    <div className="w-full max-w-[95%] rounded-xl border border-border bg-surface overflow-hidden text-xs">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
        <span className="text-accent select-none" aria-hidden>
          ✦
        </span>
        <span className="font-medium text-text">Full resume rewrite</span>
      </div>
      <div className="px-3 py-2 bg-accent-muted">
        <pre className="whitespace-pre-wrap font-mono text-[11px] text-text leading-relaxed line-clamp-6">
          {preview}
          {content.split('\n').length > 6 && '\n…'}
        </pre>
      </div>
      {applied ? (
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-border text-accent">
          <CheckIcon size={11} weight="bold" />
          <span>Applied to resume</span>
        </div>
      ) : (
        <div className="flex justify-end gap-2 px-3 py-2 border-t border-border">
          <button
            onClick={handleApply}
            className="flex items-center gap-1 px-2.5 py-1 bg-accent text-accent-text rounded-md hover:opacity-90 transition-opacity duration-150"
          >
            <CheckIcon size={11} weight="bold" />
            Replace resume
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Suggestion card
// ---------------------------------------------------------------------------

interface SuggestionCardProps {
  edit: Edit;
  onApply: () => void;
  onDismiss: () => void;
}

function SuggestionCard({ edit, onApply, onDismiss }: SuggestionCardProps) {
  return (
    <div className="w-full max-w-[95%] rounded-xl border border-border bg-surface overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
        <span className="text-accent select-none" aria-hidden>
          ✦
        </span>
        <span className="font-medium text-text">
          {edit.status === 'applied' ? 'Applied' : 'Suggested edit'}
        </span>
      </div>

      {/* Diff */}
      <div className="flex flex-col divide-y divide-border">
        <div className="px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-faint mb-1.5">
            Before
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[11px] text-muted leading-relaxed">
            {edit.search}
          </pre>
        </div>
        <div className="px-3 py-2 bg-accent-muted">
          <div className="text-[10px] uppercase tracking-wide text-accent mb-1.5">
            After
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[11px] text-text leading-relaxed">
            {edit.replace}
          </pre>
        </div>
      </div>

      {/* Actions */}
      {edit.status === 'pending' && (
        <div className="flex justify-end gap-2 px-3 py-2 border-t border-border">
          <button
            onClick={onDismiss}
            className="flex items-center gap-1 px-2 py-1 text-muted hover:text-text rounded-md hover:bg-surface-2 transition-colors duration-150"
          >
            <XIcon size={11} />
            Dismiss
          </button>
          <button
            onClick={onApply}
            className="flex items-center gap-1 px-2.5 py-1 bg-accent text-accent-text rounded-md hover:opacity-90 transition-opacity duration-150"
          >
            <CheckIcon size={11} weight="bold" />
            Apply
          </button>
        </div>
      )}

      {edit.status === 'applied' && (
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-border text-accent">
          <CheckIcon size={11} weight="bold" />
          <span>Applied to resume</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thinking indicator
// ---------------------------------------------------------------------------

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 items-center h-4">
      <span
        className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </span>
  );
}
