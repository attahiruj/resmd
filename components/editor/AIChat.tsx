'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
  CheckIcon,
  CopyIcon,
  PaperPlaneTiltIcon,
  XIcon,
} from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import { parseSuggestion } from '@/lib/prompts';
import { AI_MODEL_STORAGE_KEY } from '@/lib/ai';

interface ModelOption {
  id: string;
  name: string;
}

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
}

interface AIChatProps {
  resumeContent: string;
  onApplyEdit?: (search: string, replace: string) => void;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AIChat({ resumeContent, onApplyEdit }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [minimized, setMinimized] = useState(false);
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

  const handleApply = (msgIdx: number, editIdx: number) => {
    const edit = messages[msgIdx]?.edits[editIdx];
    if (!edit || edit.status !== 'pending') return;
    onApplyEdit?.(edit.search, edit.replace);
    updateEditStatus(msgIdx, editIdx, 'applied');
  };

  const handleDismiss = (msgIdx: number, editIdx: number) => {
    updateEditStatus(msgIdx, editIdx, 'dismissed');
  };

  const handleApplyAll = (msgIdx: number) => {
    const msg = messages[msgIdx];
    if (!msg) return;
    msg.edits.forEach((edit, ei) => {
      if (edit.status === 'pending') {
        onApplyEdit?.(edit.search, edit.replace);
      }
    });
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
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
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
        const { prose, edits } = parseSuggestion(data.reply);
        setMessages([
          ...next,
          {
            role: 'assistant',
            prose,
            edits: edits.map((e) => ({
              ...e,
              status: 'pending' as EditStatus,
            })),
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
      inputRef.current?.focus();
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

  return (
    <div className="flex flex-col border-t border-border bg-editor-bg flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
        <span className="flex items-center gap-1.5 text-xs text-faint select-none">
          <span className="text-accent" aria-hidden>
            ✦
          </span>
          AI Assistant
        </span>
        <div className="flex items-center gap-1.5">
          {models.length > 0 && (
            <div className="relative">
              {/* Picker — opens upward */}
              {showModelPicker && (
                <div
                  ref={pickerRef}
                  className="absolute bottom-full right-0 mb-1.5 w-56 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: '240px' }}
                  >
                    {models.map((m) => {
                      const isActive = m.id === selectedModel;
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleModelChange(m.id)}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors duration-100 ${
                            isActive
                              ? 'bg-accent-muted text-accent'
                              : 'text-text hover:bg-surface-2'
                          }`}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trigger */}
              <button
                ref={pickerTriggerRef}
                onClick={() => setShowModelPicker((v) => !v)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted hover:text-text hover:bg-surface-2 border border-border transition-colors duration-150"
                title="Select AI model"
              >
                <span className="max-w-[120px] truncate">
                  {models.find((m) => m.id === selectedModel)?.name ?? '…'}
                </span>
                {showModelPicker ? (
                  <CaretUpIcon
                    size={11}
                    weight="bold"
                    className="flex-shrink-0"
                  />
                ) : (
                  <CaretDownIcon
                    size={11}
                    weight="bold"
                    className="flex-shrink-0"
                  />
                )}
              </button>
            </div>
          )}
          <button
            onClick={() => setMinimized((m) => !m)}
            className="p-1 rounded text-muted hover:text-text hover:bg-surface-2 transition-colors duration-150"
            title={minimized ? 'Expand' : 'Collapse'}
          >
            {minimized ? (
              <CaretUpIcon size={14} />
            ) : (
              <CaretDownIcon size={14} />
            )}
          </button>
        </div>
      </div>

      {!minimized && messages.length > 0 && (
        <div
          ref={historyRef}
          className="overflow-y-auto px-4 py-3 flex flex-col gap-3"
          style={{ maxHeight: '300px' }}
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
                <button
                  onClick={() => handleApplyAll(mi)}
                  className="self-start flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent text-accent-text rounded-lg hover:opacity-90 transition-opacity duration-150"
                >
                  <CheckIcon size={12} weight="bold" />
                  Apply all (
                  {msg.edits.filter((e) => e.status === 'pending').length})
                </button>
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
      {!minimized && (
        <div className="flex items-end gap-2 px-3 py-2">
          <span
            className="text-accent select-none text-sm flex-shrink-0 pb-1.5"
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
            placeholder="Ask AI to improve your resume…"
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-text placeholder:text-faint outline-none disabled:opacity-50 resize-none overflow-y-auto max-h-36 leading-5"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 p-1.5 rounded-lg text-accent hover:bg-accent-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="Send (Enter)"
          >
            <PaperPlaneTiltIcon size={16} weight="fill" />
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
