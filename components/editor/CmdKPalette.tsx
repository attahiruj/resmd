'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getAllTemplates } from '@/lib/templates';

interface CmdKPaletteProps {
  rawContent: string;
  templateId: string;
  resumeId?: string;
  onExportPDF: () => void;
  onCloneAndTailor: () => void;
  onSelectTemplate: (id: string) => void;
  onJumpToSection: (word: string) => void;
  onClose: () => void;
}

type Item = {
  icon: string;
  label: string;
  hint?: string[];
  accent?: boolean;
  action: () => void;
};

type Group = { group: string; items: Item[] };

// Only top-level # headings
function parseSections(raw: string): string[] {
  return raw
    .split('\n')
    .filter((l) => /^#\s+/.test(l))
    .map((l) => l.replace(/^#\s+/, '').trim())
    .filter(Boolean)
    .slice(0, 8);
}

function KbdBadge({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {keys.map((k, i) => (
        <kbd
          key={i}
          className="px-2 py-1 bg-[#252525] border border-[#383838] rounded text-xs text-[#aaa] font-sans leading-none"
        >
          {k}
        </kbd>
      ))}
    </div>
  );
}

export default function CmdKPalette({
  rawContent,
  templateId,
  resumeId,
  onExportPDF,
  onCloneAndTailor,
  onSelectTemplate,
  onJumpToSection,
  onClose,
}: CmdKPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const templates = getAllTemplates();
  const sections = useMemo(() => parseSections(rawContent), [rawContent]);
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPod|iPad/.test(navigator.platform);
  const mod = isMac ? '⌘' : 'Ctrl';

  const allGroups: Group[] = useMemo(
    () => [
      {
        group: 'Actions',
        items: [
          {
            icon: '↓',
            label: 'Export PDF',
            hint: [mod, 'E'],
            action: () => {
              onExportPDF();
              onClose();
            },
          },
          {
            icon: '⎇',
            label: 'Clone & tailor for new role',
            hint: [mod, '⇧', 'D'],
            action: () => {
              onCloneAndTailor();
              onClose();
            },
          },
          {
            icon: 'A',
            label: 'AI: improve selected bullets',
            hint: [mod, '⇧', 'A'],
            accent: true,
            action: onClose,
          },
        ].filter((item) => item.label !== 'Export PDF' || !!resumeId),
      },
      {
        group: 'Template',
        items: templates
          .filter((t) => t.id !== templateId)
          .slice(0, 5)
          .map((t) => ({
            icon: '◑',
            label: `Switch to ${t.name}`,
            action: () => {
              onSelectTemplate(t.id);
              onClose();
            },
          })),
      },
      {
        group: 'Navigate',
        items: sections.map((s) => ({
          icon: '#',
          label: `Jump to ${s}`,
          action: () => {
            onJumpToSection(s.split(/\s+/)[0]);
            onClose();
          },
        })),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [templateId, sections, resumeId]
  );

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return allGroups;
    const q = query.toLowerCase();
    return allGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => i.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [allGroups, query]);

  const flatItems = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups]
  );

  // Reset selection on query change
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll selected item into view on keyboard navigation
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      '[data-selected="true"]'
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, flatItems.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        flatItems[selectedIdx]?.action();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [flatItems, selectedIdx, onClose]);

  let globalIdx = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-[580px] bg-[#161616] border border-[#2a2a2a] rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e1e1e] flex-shrink-0">
          <span className="text-[#555] text-base select-none">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Export PDF, clone, AI improve, switch template…"
            className="flex-1 bg-transparent text-base text-[#ccc] placeholder:text-[#444] outline-none"
          />
          <kbd className="px-2 py-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded text-xs text-[#555] font-sans leading-none select-none">
            esc
          </kbd>
        </div>

        {/* Command groups */}
        <div ref={listRef} className="max-h-[440px] overflow-y-auto">
          {filteredGroups.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-[#333]">
              No results
            </div>
          )}
          {filteredGroups.map((g) => (
            <div key={g.group}>
              <div className="px-5 pt-4 pb-1.5">
                <span className="text-xs text-[#3a3a3a] tracking-[0.12em] uppercase font-medium">
                  {g.group}
                </span>
              </div>
              {g.items.map((item) => {
                const idx = globalIdx++;
                const isSelected = idx === selectedIdx;
                return (
                  <button
                    key={item.label}
                    data-selected={isSelected}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors border-l-2 ${
                      isSelected
                        ? 'bg-[#1e1e1e] border-l-accent'
                        : 'bg-transparent border-transparent hover:bg-[#181818]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm border ${
                        item.accent
                          ? 'bg-accent/20 border-accent/40 text-accent'
                          : 'bg-[#1e1e1e] border-[#2a2a2a] text-[#666]'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`flex-1 text-[15px] ${isSelected ? 'text-[#e8e8e8]' : 'text-[#777]'}`}
                    >
                      {item.label}
                    </span>
                    {item.hint && <KbdBadge keys={item.hint} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer usage guide */}
        <div className="flex items-center gap-5 px-5 py-3 border-t border-[#1e1e1e] bg-[#111] flex-shrink-0">
          {[
            { keys: ['↑', '↓'], label: 'navigate' },
            { keys: ['↵'], label: 'select' },
            { keys: ['esc'], label: 'close' },
            { keys: [mod, 'K'], label: 'toggle' },
          ].map(({ keys, label }) => (
            <div key={label} className="flex items-center gap-2">
              <KbdBadge keys={keys} />
              <span className="text-xs text-[#444]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
