'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { getAllTemplates } from '@/lib/templates';
import type { ParsedResume } from '@/types/resume';
import TemplateMiniPreview from './TemplateMiniPreview';

interface TemplateGalleryProps {
  resume: ParsedResume;
  templateId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function TemplateGallery({
  resume,
  templateId,
  onSelect,
  onClose,
}: TemplateGalleryProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const templates = getAllTemplates();

  const categories = useMemo(() => {
    const seen = new Set<string>();
    templates.forEach((t) => seen.add(t.category));
    return ['all', ...Array.from(seen)];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      const matchesCategory =
        activeCategory === 'all' || t.category === activeCategory;
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [templates, search, activeCategory]);

  return (
    <div className="flex flex-col h-full bg-surface-2">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 h-[37px] flex-shrink-0 border-b border-border bg-surface">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-6 h-6 rounded-md text-muted hover:text-text hover:bg-surface-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent flex-shrink-0"
          title="Back to preview"
        >
          <ArrowLeftIcon size={14} />
        </button>
        <span className="text-sm font-medium text-text">Choose a Template</span>
        <span className="ml-auto text-xs text-faint">
          {templates.length} templates
        </span>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="relative">
          <MagnifyingGlassIcon
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-150"
          />
        </div>
      </div>

      {/* Category chips */}
      <div
        className="flex gap-1.5 px-3 pb-3 flex-shrink-0 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-none px-2.5 py-1 rounded-full text-[11px] font-medium capitalize transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              activeCategory === cat
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-muted hover:text-text hover:border-border'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-3 pt-1 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted">No templates match</p>
            {search && (
              <p className="text-xs text-faint mt-1">&ldquo;{search}&rdquo;</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((tpl) => (
              <TemplateMiniPreview
                key={tpl.id}
                template={tpl}
                resume={resume}
                isSelected={tpl.id === templateId}
                onClick={() => onSelect(tpl.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
