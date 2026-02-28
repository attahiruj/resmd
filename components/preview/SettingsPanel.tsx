'use client'

import { SlidersHorizontalIcon } from '@phosphor-icons/react'
import type { ResumeSettings } from '@/types/resume'
import { DEFAULT_SETTINGS } from '@/types/resume'

interface SettingsPanelProps {
  settings: ResumeSettings
  onSettingChange: (directiveKey: string, value: number) => void
}

interface SettingRow {
  label: string
  key: string
  prop: keyof Required<ResumeSettings>
  min: number
  max: number
  step: number
  unit?: string
}

const ROWS: SettingRow[] = [
  { label: 'Font Size',           key: 'font.size',     prop: 'fontSize',     min: 7,    max: 14,  step: 0.5, unit: 'pt' },
  { label: 'Line Height',         key: 'line.height',   prop: 'lineHeight',   min: 1.0,  max: 2.5, step: 0.1 },
  { label: 'Left & Right Margin', key: 'margin.h',      prop: 'marginH',      min: 10,   max: 80,  step: 2,   unit: 'pt' },
  { label: 'Top & Bottom Margin', key: 'margin.v',      prop: 'marginV',      min: 10,   max: 80,  step: 2,   unit: 'pt' },
  { label: 'Entry Spacing',       key: 'entry.spacing', prop: 'entrySpacing', min: 2,    max: 24,  step: 1,   unit: 'pt' },
]

export default function SettingsPanel({ settings, onSettingChange }: SettingsPanelProps) {
  const resolved = { ...DEFAULT_SETTINGS, ...settings }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-xl p-4 w-60">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontalIcon size={13} className="text-muted" />
        <span className="text-sm font-medium text-text">Layout</span>
      </div>

      <div className="flex flex-col gap-3.5">
        {ROWS.map(row => {
          const value = resolved[row.prop] as number
          return (
            <div key={row.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-muted">{row.label}</label>
                <span className="text-xs font-mono text-text tabular-nums">
                  {value}{row.unit ?? ''}
                </span>
              </div>
              <input
                type="range"
                min={row.min}
                max={row.max}
                step={row.step}
                value={value}
                onChange={e => onSettingChange(row.key, parseFloat(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: 'var(--color-accent)' }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
