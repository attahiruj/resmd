'use client';

import { XIcon } from '@phosphor-icons/react';
import AIChat from '@/components/editor/AIChat';

interface AIPanelProps {
  rawContent: string;
  onClose: () => void;
  onApplyEdit?: (search: string, replace: string) => void;
}

export default function AIPanel({
  rawContent,
  onClose,
  onApplyEdit,
}: AIPanelProps) {
  return (
    <div
      className="fixed top-[60px] right-0 bottom-0 w-[380px] bg-surface border-l border-border z-40 flex flex-col"
      style={{
        transform: 'translateX(0)',
        transition: 'transform 200ms ease-out',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-accent text-sm select-none" aria-hidden>
            ✦
          </span>
          <span className="text-sm font-medium text-text">AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Close"
        >
          <XIcon size={16} />
        </button>
      </div>

      {/* Chat area fills remaining height */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <AIChat resumeContent={rawContent} onApplyEdit={onApplyEdit} />
      </div>
    </div>
  );
}
