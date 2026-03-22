'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SquaresFourIcon,
  SlidersHorizontalIcon,
  CaretDownIcon,
} from '@phosphor-icons/react';
import LivePreview from './LivePreview';
import SettingsPanel from './SettingsPanel';
import TemplateGallery from './TemplateGallery';
import { getAllTemplates } from '@/lib/templates';
import { parseResume } from '@/lib/parser';

interface PreviewPaneProps {
  rawContent: string;
  templateId: string;
  onTemplateChange: (id: string) => void;
  onContentChange?: (value: string) => void;
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
  onTextDoubleClick,
}: PreviewPaneProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);
  const templates = getAllTemplates();
  const current = templates.find((t) => t.id === templateId);

  const parsedResume = useMemo(() => parseResume(rawContent), [rawContent]);

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
    <div className="flex flex-col h-full bg-surface-2">
      {/* Top bar */}
      <div className="flex items-center justify-between px-2.5 h-[37px] flex-shrink-0 border-b border-border bg-surface z-10">
        {/* Left: template selector chip */}
        <button
          onClick={() => setShowGallery(true)}
          className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-md border border-border bg-surface-2 hover:border-accent/60 hover:bg-surface-3 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
        >
          <SquaresFourIcon
            size={12}
            className="text-muted flex-shrink-0 group-hover:text-accent transition-colors duration-150"
          />
          <span className="text-xs font-medium text-text truncate max-w-[140px]">
            {current?.name ?? templateId}
          </span>
          <CaretDownIcon
            size={10}
            weight="bold"
            className="text-muted flex-shrink-0 group-hover:text-accent transition-colors duration-150"
          />
        </button>

        {/* Right: settings button */}
        <div className="relative flex-shrink-0">
          {showSettings && (
            <div
              ref={settingsPanelRef}
              className="absolute top-full right-0 mt-2 z-50"
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
      </div>

      {/* Content: gallery or live preview */}
      <div className="flex-1 overflow-hidden">
        {showGallery ? (
          <TemplateGallery
            resume={parsedResume}
            templateId={templateId}
            onSelect={onTemplateChange}
            onClose={() => setShowGallery(false)}
          />
        ) : (
          <LivePreview
            rawContent={rawContent}
            templateId={templateId}
            onTextDoubleClick={onTextDoubleClick}
          />
        )}
      </div>
    </div>
  );
}
