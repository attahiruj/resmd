'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SquaresFourIcon,
  CaretDownIcon,
  SlidersHorizontalIcon,
} from '@phosphor-icons/react';
import LivePreview from './LivePreview';
import SettingsPanel from './SettingsPanel';
import { getAllTemplates } from '@/lib/templates';
import { parseResume } from '@/lib/parser';

interface PreviewPaneProps {
  rawContent: string;
  templateId: string;
  onTemplateChange: (id: string) => void;
  onContentChange?: (value: string) => void;
  isPro?: boolean;
  onTextDoubleClick?: (word: string, context: string) => void;
}

function upsertDirective(raw: string, key: string, value: number): string {
  const escaped = key.replace(/\./g, '\\.');
  const regex = new RegExp(`^!${escaped}:.*$`, 'm');
  const line = `!${key}: ${value}`;
  if (regex.test(raw)) {
    return raw.replace(regex, line);
  }
  return line + '\n' + raw;
}

export default function PreviewPane({
  rawContent,
  templateId,
  onTemplateChange,
  onContentChange,
  isPro = false,
  onTextDoubleClick,
}: PreviewPaneProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);
  const templates = getAllTemplates();
  const current = templates.find((t) => t.id === templateId);

  const parsedResume = useMemo(() => parseResume(rawContent), [rawContent]);

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  // Close settings panel on outside click
  useEffect(() => {
    if (!showSettings) return;
    const handler = (e: MouseEvent) => {
      if (
        settingsPanelRef.current &&
        !settingsPanelRef.current.contains(e.target as Node) &&
        settingsTriggerRef.current &&
        !settingsTriggerRef.current.contains(e.target as Node)
      ) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSettings]);

  function handleSettingChange(key: string, value: number) {
    if (!onContentChange) return;
    onContentChange(upsertDirective(rawContent, key, value));
  }

  return (
    <div className="relative h-full flex flex-col bg-surface-2">
      {/* Resume preview scroll area */}
      <div className="flex-1 overflow-hidden">
        <LivePreview
          rawContent={rawContent}
          templateId={templateId}
          isPro={isPro}
          onTextDoubleClick={onTextDoubleClick}
        />
      </div>

      {/* Settings trigger — top-right corner */}
      <div className="absolute top-3 right-3 z-50">
        {showSettings && (
          <div
            ref={settingsPanelRef}
            className="absolute top-full right-0 mt-2"
          >
            <SettingsPanel
              settings={parsedResume.settings}
              onSettingChange={handleSettingChange}
            />
          </div>
        )}
        <button
          ref={settingsTriggerRef}
          onClick={() => setShowSettings((v) => !v)}
          title="Layout settings"
          className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            showSettings
              ? 'bg-accent-muted border-accent text-accent'
              : 'bg-surface border-border text-muted hover:text-text hover:bg-surface-2'
          }`}
        >
          <SlidersHorizontalIcon size={13} />
        </button>
      </div>

      {/* Template picker trigger — floating pill at bottom center */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        {/* Picker card — appears above the trigger */}
        {showPicker && (
          <div
            ref={pickerRef}
            className="bg-surface border border-border rounded-xl shadow-xl p-2.5 flex gap-2 overflow-x-auto max-w-[480px]"
            style={{ scrollbarWidth: 'none' }}
          >
            {templates.map((tpl) => {
              const isActive = tpl.id === templateId;
              const isLocked = tpl.isPro && !isPro;
              return (
                <button
                  key={tpl.id}
                  disabled={isLocked}
                  onClick={() => {
                    if (!isLocked) {
                      onTemplateChange(tpl.id);
                      setShowPicker(false);
                    }
                  }}
                  title={isLocked ? 'Upgrade to Pro' : tpl.name}
                  className={`flex-none flex flex-col items-start px-3 py-2 rounded-lg border transition-colors duration-150 min-w-[96px] ${
                    isActive
                      ? 'border-accent bg-accent-muted'
                      : isLocked
                        ? 'border-border opacity-40 cursor-not-allowed'
                        : 'border-border hover:bg-surface-2 cursor-pointer'
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${isActive ? 'text-accent' : 'text-text'}`}
                  >
                    {tpl.name}
                  </span>
                  {tpl.isPro && (
                    <span className="mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">
                      Pro
                    </span>
                  )}
                  {!tpl.isPro && (
                    <span className="mt-0.5 text-[10px] text-faint">
                      {tpl.category}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Trigger pill */}
        <button
          ref={triggerRef}
          onClick={() => setShowPicker((v) => !v)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border shadow-lg text-sm text-text hover:bg-surface-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <SquaresFourIcon size={13} className="text-muted" />
          <span>{current?.name ?? templateId}</span>
          <CaretDownIcon
            size={11}
            weight="bold"
            className={`text-muted transition-transform duration-150 ${showPicker ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </div>
  );
}
