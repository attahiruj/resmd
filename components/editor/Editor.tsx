'use client'

import { useEffect, useRef, useState } from 'react'
import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
  keymap,
} from '@codemirror/view'
import { EditorState, Compartment, Prec, type Range } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

// Build decorations for ResMarkup syntax — line-level classes + key mark
function buildDecorations(view: EditorView): DecorationSet {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deco: Range<any>[] = []
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      const line = view.state.doc.lineAt(pos)
      const text = line.text

      if (/^# .+/.test(text)) {
        deco.push(Decoration.line({ class: 'cm-resmd-section' }).range(line.from))
      } else if (/^## .+/.test(text)) {
        deco.push(Decoration.line({ class: 'cm-resmd-entry' }).range(line.from))
      } else if (/^- /.test(text)) {
        deco.push(Decoration.line({ class: 'cm-resmd-bullet' }).range(line.from))
      } else {
        // Key-value: only match lines not starting with # and with a short key (≤30 chars)
        const kvMatch = /^([A-Za-z][^:\n#]{1,30}):\s*.+/.exec(text)
        if (kvMatch && !text.startsWith('#')) {
          const colonIdx = text.indexOf(':')
          if (colonIdx > 0) {
            deco.push(
              Decoration.mark({ class: 'cm-resmd-key' }).range(line.from, line.from + colonIdx)
            )
          }
        }
      }

      pos = line.to + 1
    }
  }
  return Decoration.set(deco, true)
}

const resMarkupHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = buildDecorations(view)
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view)
      }
    }
  },
  { decorations: (v) => v.decorations }
)

// Build editor theme using CSS custom properties — adapts to dark/light automatically
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
    '.cm-selectionBackground': { background: 'var(--color-accent-muted) !important' },
    '&.cm-focused .cm-selectionBackground': {
      background: 'var(--color-accent-muted) !important',
    },
    '.cm-gutters': { display: 'none' },
    '.cm-activeLine': { backgroundColor: 'transparent' },
  })
}

const DEFAULT_FONT_SIZE = 14

export default function Editor({ value, onChange }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fontSizeRef = useRef(DEFAULT_FONT_SIZE)
  const themeCompartment = useRef(new Compartment())
  const zoomPillTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)
  const [showZoomPill, setShowZoomPill] = useState(false)

  // Keep onChange ref current to avoid stale closures
  onChangeRef.current = onChange

  // Stored in a ref so the keymap closure always calls the latest version
  const changeZoomRef = useRef((delta: number) => {
    const next = Math.max(10, Math.min(24, fontSizeRef.current + delta))
    if (next === fontSizeRef.current) return
    fontSizeRef.current = next
    setFontSize(next)
    const view = viewRef.current
    if (view) {
      view.dispatch({
        effects: themeCompartment.current.reconfigure(makeTheme(next)),
      })
    }
    setShowZoomPill(true)
    if (zoomPillTimer.current) clearTimeout(zoomPillTimer.current)
    zoomPillTimer.current = setTimeout(() => setShowZoomPill(false), 1500)
  })

  useEffect(() => {
    if (!containerRef.current) return

    const zoomKeymap = keymap.of([
      { key: 'Ctrl-=', run: () => { changeZoomRef.current(1); return true } },
      { key: 'Ctrl-Shift-=', run: () => { changeZoomRef.current(1); return true } },
      { key: 'Ctrl--', run: () => { changeZoomRef.current(-1); return true } },
      { key: 'Ctrl-0', run: () => { changeZoomRef.current(14 - fontSizeRef.current); return true } },
    ])

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          Prec.highest(zoomKeymap),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          markdown(),
          EditorView.lineWrapping,
          resMarkupHighlight,
          themeCompartment.current.of(makeTheme(fontSizeRef.current)),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newValue = update.state.doc.toString()
              onChangeRef.current(newValue)
              if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
              saveTimerRef.current = setTimeout(() => {
                localStorage.setItem('resmd_draft', newValue)
              }, 500)
            }
          }),
        ],
      }),
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (zoomPillTimer.current) clearTimeout(zoomPillTimer.current)
      view.destroy()
      viewRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external value changes (e.g. AI suggestion applied from parent)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  return (
    <div className="relative h-full">
      <div ref={containerRef} className="h-full" />

      {/* Zoom level pill — fades in on zoom, disappears after 1.5s */}
      <div
        className={`absolute bottom-4 right-4 text-xs px-2 py-0.5 rounded-md bg-surface border border-border text-muted pointer-events-none select-none transition-opacity duration-300 ${
          showZoomPill ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {fontSize}px
      </div>
    </div>
  )
}
