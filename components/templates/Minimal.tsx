'use client'

import React from 'react'
import type {
  TemplateProps,
  ResumeSection,
  SectionItem,
  EntryItem,
  KeyValueItem,
} from '@/types/resume'

// Keys treated as header metadata — not shown in the contact row
const HEADER_META_KEYS = new Set(['name', 'title', 'role', 'position'])

export default function Minimal({ resume, isPro }: TemplateProps) {
  const { sections, meta } = resume

  // Find header section: first keyvalue-hinted or 'bio'-titled section, else first section
  const headerSection =
    sections.find(s => s.hint === 'keyvalue' || s.title.toLowerCase() === 'bio') ??
    sections[0] ??
    null

  // Contact items: keyvalue items in the header section that aren't name/title/role/position
  const contactItems = (headerSection?.items ?? []).filter(
    (i): i is KeyValueItem =>
      i.kind === 'keyvalue' && !HEADER_META_KEYS.has(i.key.toLowerCase()),
  )

  const bodySections = sections.filter(s => s !== headerSection)

  return (
    <article
      className="bg-white text-gray-900 px-14 py-10 min-h-full print:shadow-none"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* ── Header ── */}
      <header className="mb-10">
        {meta.name && (
          <h1
            className="font-bold text-gray-900 leading-none mb-1"
            style={{ fontSize: '2.5rem' }}
          >
            {meta.name}
          </h1>
        )}
        {meta.title && (
          <p className="text-base text-gray-500 mt-1 mb-2">{meta.title}</p>
        )}
        {contactItems.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {contactItems.map((item, i) => (
              <React.Fragment key={item.key}>
                {i > 0 && <span className="mx-2 text-gray-300">·</span>}
                <span>{item.value}</span>
              </React.Fragment>
            ))}
          </p>
        )}
      </header>

      {/* ── Body sections ── */}
      {bodySections.map(section => (
        <SectionBlock key={section.id} section={section} />
      ))}

      {/* ── Free watermark ── */}
      {!isPro && (
        <footer className="mt-12 pt-3 border-t border-gray-200 text-center text-xs text-gray-400 print:block">
          Created with resmd · resmd.app
        </footer>
      )}
    </article>
  )
}

function SectionBlock({ section }: { section: ResumeSection }) {
  if (section.items.length === 0) return null

  return (
    <section className="mb-7">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1.5 mb-3">
        {section.title}
      </h2>
      <div>
        {section.items.map((item, i) => (
          <ItemBlock key={i} item={item} isKeyValueSection={section.hint === 'keyvalue'} />
        ))}
      </div>
    </section>
  )
}

function ItemBlock({
  item,
  isKeyValueSection,
}: {
  item: SectionItem
  isKeyValueSection: boolean
}) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        // Label + pill tags (for Skills-like sections)
        const tags = item.value
          .split(',')
          .map(v => v.trim())
          .filter(Boolean)
        return (
          <div className="flex flex-wrap items-baseline gap-y-1 mb-2.5 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400 mr-3 w-20 shrink-0">
              {item.key}
            </span>
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )
      }
      // Regular inline key: value
      return (
        <div className="flex gap-x-2 text-sm mb-1.5">
          <span className="text-gray-400 shrink-0">{item.key}:</span>
          <span className="text-gray-800">{item.value}</span>
        </div>
      )
    }

    case 'entry':
      return <EntryBlock entry={item} />

    case 'bullet':
      return (
        <div className="flex gap-x-2 text-sm mb-1.5">
          <span className="text-gray-400 select-none shrink-0">–</span>
          <span className="text-gray-800">{item.text}</span>
        </div>
      )

    case 'text':
      return (
        <p className="text-sm text-gray-700 mb-2 leading-relaxed">{item.text}</p>
      )
  }
}

function EntryBlock({ entry }: { entry: EntryItem }) {
  return (
    <div className="mb-4">
      {/* Heading row: role + org on left, meta (dates etc.) on right */}
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <div className="text-sm text-gray-900">
          {entry.role ? (
            <>
              <span className="font-semibold">{entry.role}</span>
              {entry.organization && (
                <span className="font-normal text-gray-600"> @ {entry.organization}</span>
              )}
            </>
          ) : (
            <span className="font-semibold">{entry.heading}</span>
          )}
        </div>
        {entry.meta.length > 0 && (
          <div className="text-xs text-gray-400 whitespace-nowrap shrink-0">
            {entry.meta.join(' · ')}
          </div>
        )}
      </div>

      {/* Children: bullets and text, indented */}
      {entry.children.length > 0 && (
        <div className="pl-3 border-l-2 border-gray-100 mt-1.5 text-[0.8125rem]">
          {entry.children.map((child, i) => (
            <ItemBlock key={i} item={child} isKeyValueSection={false} />
          ))}
        </div>
      )}
    </div>
  )
}
