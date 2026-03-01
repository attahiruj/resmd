'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
  keymap,
} from '@codemirror/view';
import { EditorState, Compartment, Prec, type Range } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { SparkleIcon } from '@phosphor-icons/react';
import EnhanceInput from '@/components/editor/EnhanceInput';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  jumpTarget?: { word: string; context: string } | null;
  onJumpComplete?: () => void;
  resumeContext?: string;
  onEnhance?: (selectedText: string, replacement: string) => void;
}

// ─── Format helpers (module-level, pure functions on EditorView) ─────────────

function applyInlineToView(view: EditorView, marker: string) {
  const { from, to } = view.state.selection.main;
  if (from === to) return;
  const text = view.state.doc.sliceString(from, to);
  // Toggle: unwrap if already wrapped, otherwise wrap
  const isWrapped =
    text.length > marker.length * 2 &&
    text.startsWith(marker) &&
    text.endsWith(marker);
  if (isWrapped) {
    const inner = text.slice(marker.length, -marker.length);
    view.dispatch({
      changes: { from, to, insert: inner },
      selection: { anchor: from, head: from + inner.length },
    });
  } else {
    view.dispatch({
      changes: { from, to, insert: `${marker}${text}${marker}` },
      selection: { anchor: from, head: to + marker.length * 2 },
    });
  }
}

function applyHeadingToView(view: EditorView, level: number) {
  const prefix = '#'.repeat(level) + ' ';
  const { from, to } = view.state.selection.main;
  const startLine = view.state.doc.lineAt(from);
  const endLine = view.state.doc.lineAt(to);

  const lines = [];
  for (let n = startLine.number; n <= endLine.number; n++) {
    lines.push(view.state.doc.line(n));
  }

  const allMatch = lines.every((l) => l.text.startsWith(prefix));

  const changes = lines.map((line) => {
    if (allMatch) {
      return { from: line.from, to: line.from + prefix.length, insert: '' };
    }
    const stripped = line.text.replace(/^#{1,6} /, '');
    return { from: line.from, to: line.to, insert: prefix + stripped };
  });

  view.dispatch({ changes });
}

// ─── Preview → editor jump helper ────────────────────────────────────────────

function findBestOccurrence(
  content: string,
  word: string,
  context: string
): number {
  // Extract meaningful words from context (length > 2 to skip noise)
  const contextWords = context
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let bestIdx = -1;
  let bestScore = -1;
  let searchFrom = 0;

  while (true) {
    const idx = content.indexOf(word, searchFrom);
    if (idx === -1) break;

    if (contextWords.length > 0) {
      const lineStart = content.lastIndexOf('\n', idx) + 1;
      const lineEnd = content.indexOf('\n', idx);
      const line = content
        .slice(lineStart, lineEnd === -1 ? content.length : lineEnd)
        .toLowerCase();
      const score = contextWords.filter((w) => line.includes(w)).length;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    } else {
      // No context — take the first occurrence
      return idx;
    }

    searchFrom = idx + 1;
  }

  return bestIdx;
}

// ─── Syntax highlight plugin ─────────────────────────────────────────────────

function buildDecorations(view: EditorView): DecorationSet {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deco: Range<any>[] = [];
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      const line = view.state.doc.lineAt(pos);
      const text = line.text;

      if (/^!/.test(text)) {
        deco.push(
          Decoration.line({ class: 'cm-resmd-directive' }).range(line.from)
        );
      } else if (/^# .+/.test(text)) {
        deco.push(
          Decoration.line({ class: 'cm-resmd-section' }).range(line.from)
        );
      } else if (/^## .+/.test(text)) {
        deco.push(
          Decoration.line({ class: 'cm-resmd-entry' }).range(line.from)
        );
      } else if (/^- /.test(text)) {
        deco.push(
          Decoration.line({ class: 'cm-resmd-bullet' }).range(line.from)
        );
      } else {
        const kvMatch = /^([A-Za-z][^:\n#]{1,30}):\s*.+/.exec(text);
        if (kvMatch && !text.startsWith('#')) {
          const colonIdx = text.indexOf(':');
          if (colonIdx > 0) {
            deco.push(
              Decoration.mark({ class: 'cm-resmd-key' }).range(
                line.from,
                line.from + colonIdx
              )
            );
          }
        }
      }

      pos = line.to + 1;
    }
  }
  return Decoration.set(deco, true);
}

const resMarkupHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);

// ─── Editor theme ─────────────────────────────────────────────────────────────

function makeTheme(fontSize: number) {
  return EditorView.theme({
    '&': {
      height: '100%',
      background: 'var(--color-editor-bg)',
    },
    '.cm-scroller': {
      fontFamily:
        'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      lineHeight: '1.75',
    },
    '.cm-content': {
      padding: '16px 24px',
      caretColor: 'var(--color-accent)',
      color: 'var(--color-text)',
      fontSize: `${fontSize}px`,
    },
    '.cm-line': { padding: '0' },
    '&.cm-focused': { outline: 'none' },
    '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--color-accent)' },
    '.cm-selectionBackground': {
      background: 'var(--color-accent-muted) !important',
    },
    '&.cm-focused .cm-selectionBackground': {
      background: 'var(--color-accent-muted) !important',
    },
    '.cm-gutters': { display: 'none' },
    '.cm-activeLine': { backgroundColor: 'transparent' },
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

const DEFAULT_FONT_SIZE = 14;

interface SelectionPopup {
  x: number; // container-relative X center (for toolbar)
  y: number; // container-relative top of selection (for toolbar)
  bottomY: number; // container-relative bottom of first selected line (for card)
  selectedText: string;
}

export default function Editor({
  value,
  onChange,
  jumpTarget,
  onJumpComplete,
  resumeContext = '',
  onEnhance,
}: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onEnhanceRef = useRef(onEnhance);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fontSizeRef = useRef(DEFAULT_FONT_SIZE);
  const themeCompartment = useRef(new Compartment());
  const zoomPillTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [showZoomPill, setShowZoomPill] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<SelectionPopup | null>(
    null
  );
  const [showEnhanceInput, setShowEnhanceInput] = useState(false);
  const showEnhanceInputRef = useRef(false);
  showEnhanceInputRef.current = showEnhanceInput;

  onChangeRef.current = onChange;
  onEnhanceRef.current = onEnhance;

  // Handle AI enhance
  const handleEnhance = useCallback(
    (replacement: string) => {
      const view = viewRef.current;
      const popup = selectionPopup;
      if (!view || !popup) return;

      const { from, to } = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(from, to);

      // Replace the selected text with the AI response
      view.dispatch({
        changes: { from, to, insert: replacement },
        selection: { anchor: from, head: from + replacement.length },
      });

      // Notify parent if callback provided
      onEnhanceRef.current?.(selectedText, replacement);
      view.focus();

      // Close the enhance input
      setShowEnhanceInput(false);
      setSelectionPopup(null);
    },
    [selectionPopup]
  );
  useEffect(() => {
    if (!jumpTarget) return;
    const view = viewRef.current;
    if (!view) return;
    const { word, context } = jumpTarget;
    const content = view.state.doc.toString();
    const idx = findBestOccurrence(content, word, context);
    if (idx !== -1) {
      view.dispatch({
        selection: { anchor: idx, head: idx + word.length },
        scrollIntoView: true,
      });
      view.focus();
    }
    onJumpComplete?.();
  }, [jumpTarget, onJumpComplete]);

  const changeZoomRef = useRef((delta: number) => {
    const next = Math.max(10, Math.min(24, fontSizeRef.current + delta));
    if (next === fontSizeRef.current) return;
    fontSizeRef.current = next;
    setFontSize(next);
    const view = viewRef.current;
    if (view) {
      view.dispatch({
        effects: themeCompartment.current.reconfigure(makeTheme(next)),
      });
    }
    setShowZoomPill(true);
    if (zoomPillTimer.current) clearTimeout(zoomPillTimer.current);
    zoomPillTimer.current = setTimeout(() => setShowZoomPill(false), 1500);
  });

  // ── Formatting actions ──────────────────────────────────────────────────────

  const applyInline = (marker: string) => {
    const view = viewRef.current;
    if (!view) return;
    applyInlineToView(view, marker);
    view.focus();
  };

  const applyHeading = (level: number) => {
    const view = viewRef.current;
    if (!view) return;
    applyHeadingToView(view, level);
    view.focus();
  };

  // ── Editor setup ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return;

    const zoomKeymap = keymap.of([
      {
        key: 'Ctrl-=',
        run: () => {
          changeZoomRef.current(1);
          return true;
        },
      },
      {
        key: 'Ctrl-Shift-=',
        run: () => {
          changeZoomRef.current(1);
          return true;
        },
      },
      {
        key: 'Ctrl--',
        run: () => {
          changeZoomRef.current(-1);
          return true;
        },
      },
      {
        key: 'Ctrl-0',
        run: () => {
          changeZoomRef.current(14 - fontSizeRef.current);
          return true;
        },
      },
    ]);

    const formatKeymap = keymap.of([
      {
        key: 'Mod-b',
        run: (view) => {
          applyInlineToView(view, '*');
          return true;
        },
      },
      {
        key: 'Mod-i',
        run: (view) => {
          applyInlineToView(view, '~');
          return true;
        },
      },
      {
        key: 'Mod-u',
        run: (view) => {
          applyInlineToView(view, '_');
          return true;
        },
      },
    ]);

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          Prec.highest(zoomKeymap),
          Prec.high(formatKeymap),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          markdown(),
          EditorView.lineWrapping,
          resMarkupHighlight,
          themeCompartment.current.of(makeTheme(fontSizeRef.current)),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newValue = update.state.doc.toString();
              onChangeRef.current(newValue);
              if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
              saveTimerRef.current = setTimeout(() => {
                localStorage.setItem('resmd_draft', newValue);
              }, 500);
            }

            // ── Selection popup positioning ──────────────────────────────
            if (
              update.selectionSet ||
              update.docChanged ||
              update.focusChanged
            ) {
              const sel = update.state.selection.main;
              const container = containerRef.current;

              if (!sel.empty && container && update.view.hasFocus) {
                const fromCoords = update.view.coordsAtPos(sel.from);
                const toCoords = update.view.coordsAtPos(sel.to);
                if (fromCoords && toCoords) {
                  const rect = container.getBoundingClientRect();
                  // For multi-line selections, anchor popup to first line start
                  const isMultiLine = toCoords.top - fromCoords.top > 4;
                  const rawX = isMultiLine
                    ? fromCoords.left - rect.left
                    : (fromCoords.left + toCoords.right) / 2 - rect.left;
                  // Clamp so popup stays inside container (popup ~190px wide → 95px half)
                  const clampedX = Math.max(
                    95,
                    Math.min(rect.width - 95, rawX)
                  );
                  const topY = fromCoords.top - rect.top;
                  const bottomY = fromCoords.bottom - rect.top;

                  if (rafRef.current) cancelAnimationFrame(rafRef.current);
                  rafRef.current = requestAnimationFrame(() => {
                    const selectedText = update.state.doc.sliceString(
                      sel.from,
                      sel.to
                    );
                    setSelectionPopup({
                      x: clampedX,
                      y: topY,
                      bottomY,
                      selectedText,
                    });
                  });
                }
              } else {
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(() => {
                  // Don't clear if EnhanceInput is open — it stole focus intentionally
                  if (!showEnhanceInputRef.current) {
                    setSelectionPopup(null);
                    setShowEnhanceInput(false);
                  }
                });
              }
            }
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (zoomPillTimer.current) clearTimeout(zoomPillTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      view.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative h-full">
      <div ref={containerRef} className="h-full" />

      {/* Floating selection toolbar — hidden while EnhanceInput is open */}
      {selectionPopup && !showEnhanceInput && (
        <div
          className="absolute z-50 flex items-center gap-px px-1 py-1 rounded-lg border border-border bg-surface shadow-lg shadow-black/25 pointer-events-auto"
          style={{
            left: `${selectionPopup.x}px`,
            top: `${selectionPopup.y}px`,
            transform: 'translate(-50%, calc(-100% - 10px))',
          }}
        >
          {/* Inline formats — markers match parseInline: *bold* ~italic~ _underline_ */}
          <FormatBtn
            title="Bold (Ctrl+B)  →  *text*"
            onClick={() => applyInline('*')}
            className="font-bold"
          >
            B
          </FormatBtn>
          <FormatBtn
            title="Italic (Ctrl+I)  →  ~text~"
            onClick={() => applyInline('~')}
            className="italic"
          >
            I
          </FormatBtn>
          <FormatBtn
            title="Underline  →  _text_"
            onClick={() => applyInline('_')}
            className="underline"
          >
            U
          </FormatBtn>

          {/* Divider */}
          <div className="w-px h-4 bg-border mx-0.5 flex-shrink-0" />

          {/* AI Enhance button */}
          <FormatBtn
            title="Enhance with AI"
            onClick={() => {
              // Commit ref immediately — RAF may fire before React's re-render
              showEnhanceInputRef.current = true;
              if (rafRef.current) cancelAnimationFrame(rafRef.current);

              // Scroll editor up if the card (~260px) would overflow below the pane
              const view = viewRef.current;
              const container = containerRef.current;
              const popup = selectionPopup;
              if (view && container && popup) {
                const CARD_HEIGHT = 260;
                const containerH = container.getBoundingClientRect().height;
                const overflow = popup.bottomY + 8 + CARD_HEIGHT - containerH;
                if (overflow > 0) {
                  const scrollBy = overflow + 16;
                  view.scrollDOM.scrollTop += scrollBy;
                  // Adjust stored coords so card renders at the new position
                  setSelectionPopup({
                    ...popup,
                    y: popup.y - scrollBy,
                    bottomY: popup.bottomY - scrollBy,
                  });
                }
              }

              setShowEnhanceInput(true);
            }}
            className="text-secondary hover:text-bg hover:bg-secondary"
          >
            <SparkleIcon size={14} weight="fill" />
          </FormatBtn>

          {/* Heading levels */}
          {([1, 2] as const).map((level) => (
            <FormatBtn
              key={level}
              title={`Heading ${level}`}
              onClick={() => applyHeading(level)}
              className="text-[11px] font-semibold tracking-tight"
            >
              H{level}
            </FormatBtn>
          ))}

          {/* Arrow notch */}
          <span
            className="absolute left-1/2 -bottom-[5px] -translate-x-1/2 w-0 h-0 block"
            style={{
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid var(--color-border)',
            }}
          />
          <span
            className="absolute left-1/2 -bottom-[4px] -translate-x-1/2 w-0 h-0 block"
            style={{
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid var(--color-surface)',
            }}
          />
        </div>
      )}

      {/* Enhance Input Overlay */}
      {showEnhanceInput && selectionPopup && (
        <EnhanceInput
          selectedText={selectionPopup.selectedText}
          resumeContext={resumeContext}
          bottomY={selectionPopup.bottomY}
          onClose={() => {
            setShowEnhanceInput(false);
            setSelectionPopup(null);
          }}
          onApply={handleEnhance}
        />
      )}

      {/* Zoom level pill */}
      <div
        className={`absolute bottom-4 right-4 text-xs px-2 py-0.5 rounded-md bg-surface border border-border text-muted pointer-events-none select-none transition-opacity duration-300 ${
          showZoomPill ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {fontSize}px
      </div>
    </div>
  );
}

// ─── Small helper component for toolbar buttons ───────────────────────────────

function FormatBtn({
  children,
  onClick,
  title,
  className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      title={title}
      // Prevent the editor from losing focus on mousedown
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-[26px] h-[26px] flex items-center justify-center rounded text-sm text-text hover:bg-surface-2 active:bg-accent-muted transition-colors duration-100 ${className}`}
    >
      {children}
    </button>
  );
}
