'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { CheckIcon } from '@phosphor-icons/react';
import type { TemplateDefinition, ParsedResume } from '@/types/resume';

const A4_WIDTH = 595;
const A4_HEIGHT = 842;
// Show top ~80% of A4 — captures resume content without excess blank space
const CROP_HEIGHT = Math.round(A4_HEIGHT * 0.8);

interface TemplateMiniPreviewProps {
  template: TemplateDefinition;
  resume: ParsedResume;
  isSelected: boolean;
  onClick: () => void;
}

export default function TemplateMiniPreview({
  template,
  resume,
  isSelected,
  onClick,
}: TemplateMiniPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.27);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / A4_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const TemplateComponent = template.component;

  return (
    <button
      onClick={onClick}
      className="flex flex-col text-left group focus-visible:outline-none"
    >
      {/* Preview — fills card width, cropped to top 80% of A4 */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-lg border transition-all duration-150 shadow-sm ${
          isSelected
            ? 'ring-2 ring-accent border-accent'
            : 'border-border group-hover:border-accent/60 group-hover:shadow-md'
        }`}
        style={{ aspectRatio: `${A4_WIDTH} / ${CROP_HEIGHT}` }}
      >
        <Suspense
          fallback={
            <div className="absolute inset-0 animate-pulse bg-surface-3" />
          }
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: A4_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
            }}
          >
            {/* Fixed A4 page box — same as LivePreview, ensures white bg and correct clipping */}
            <div
              style={{
                width: A4_WIDTH,
                height: A4_HEIGHT,
                overflow: 'hidden',
                background: '#ffffff',
              }}
            >
              <TemplateComponent resume={resume} showHeader />
            </div>
          </div>
        </Suspense>

        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-sm">
            <CheckIcon size={10} weight="bold" color="white" />
          </div>
        )}
      </div>

      {/* Label */}
      <div className="pt-2 pb-1 px-0.5">
        <p
          className={`text-xs font-semibold truncate ${
            isSelected ? 'text-accent' : 'text-text'
          }`}
        >
          {template.name}
        </p>
        <p className="text-[10px] text-muted truncate mt-0.5">
          {template.description}
        </p>
      </div>
    </button>
  );
}
