'use client'

import React from 'react'
import type {
  TemplateProps,
  ResumeSection,
  SectionItem,
  EntryItem,
  KeyValueItem,
} from '@/types/resume'
import { renderInline } from '@/lib/renderInline'

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const HEADER_META_KEYS = new Set(['name', 'title', 'role', 'position'])

// Styles mirror pdf/Minimal.tsx 1:1 (pt → px, identical numeric values)
const S = {
  page: {
    fontFamily: FONT,
    fontSize: 10,
    color: '#1C1B18',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    lineHeight: 1.5,
    background: '#ffffff',
  },
  header: { marginBottom: 20 },
  name: { fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 3, lineHeight: 1.1 },
  jobTitle: { fontSize: 11, color: '#666666', marginBottom: 6 },
  contactRow: { display: 'flex', flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 4 },
  contactItem: { fontSize: 9, color: '#555555' },
  contactSep: { fontSize: 9, color: '#CCCCCC', marginLeft: 4, marginRight: 4 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '1.2px',
    color: '#888888',
    borderBottom: '1px solid #E0E0E0',
    paddingBottom: 3,
    marginBottom: 7,
  },
  entry: { marginBottom: 8 },
  entryHeader: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryRole: { fontSize: 10, fontWeight: 700, color: '#1A1A1A' },
  entryOrg: { fontSize: 10, fontWeight: 400, color: '#444444' },
  entryMeta: { fontSize: 9, color: '#888888', whiteSpace: 'nowrap' as const, flexShrink: 0, marginLeft: 8 },
  entryChildren: { paddingLeft: 10, marginTop: 3, borderLeft: '1px solid #EEEEEE' },
  bulletRow: { display: 'flex', flexDirection: 'row' as const, marginBottom: 2.5 },
  bulletDash: { fontSize: 10, color: '#AAAAAA', marginRight: 5, lineHeight: 1.5, flexShrink: 0 },
  bulletText: { fontSize: 10, color: '#333333', flex: 1, lineHeight: 1.5 },
  textPara: { fontSize: 10, color: '#444444', marginBottom: 4, lineHeight: 1.6 },
  kvRow: { display: 'flex', flexDirection: 'row' as const, marginBottom: 3, gap: 6 },
  kvKey: { fontSize: 9, color: '#888888', width: 60, flexShrink: 0 },
  kvValue: { fontSize: 10, color: '#333333', flex: 1 },
  kvSkillsRow: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'flex-start',
    marginBottom: 5,
    flexWrap: 'wrap' as const,
  },
  kvSkillsLabel: {
    fontSize: 8,
    color: '#888888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    width: 55,
    flexShrink: 0,
    paddingTop: 2,
  },
  kvSkillsTags: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    flex: 1,
    gap: 3,
  },
  tag: {
    fontSize: 8,
    color: '#555555',
    backgroundColor: '#F3F3F3',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 3,
  },
  footer: { marginTop: 24, borderTop: '1px solid #E8E8E8', paddingTop: 6, textAlign: 'center' as const },
  footerText: { fontSize: 8, color: '#BBBBBB' },
}

export default function Minimal({ resume, isPro }: TemplateProps) {
  const { sections, meta } = resume

  const headerSection =
    sections.find(s => s.hint === 'keyvalue' || s.title.toLowerCase() === 'bio') ??
    sections[0] ??
    null

  const contactItems = (headerSection?.items ?? []).filter(
    (i): i is KeyValueItem =>
      i.kind === 'keyvalue' && !HEADER_META_KEYS.has(i.key.toLowerCase()),
  )

  const bodySections = sections.filter(s => s !== headerSection)

  return (
    <article style={S.page}>
      <header style={S.header}>
        {meta.name && <h1 style={S.name}>{meta.name}</h1>}
        {meta.title && <p style={S.jobTitle}>{meta.title}</p>}
        {contactItems.length > 0 && (
          <div style={S.contactRow}>
            {contactItems.map((item, i) => (
              <React.Fragment key={item.key}>
                {i > 0 && <span style={S.contactSep}>·</span>}
                <span style={S.contactItem}>{item.value}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {bodySections.map(section => (
        <SectionBlock key={section.id} section={section} />
      ))}

      {!isPro && (
        <footer style={S.footer}>
          <span style={S.footerText}>Created with resmd · resmd.app</span>
        </footer>
      )}
    </article>
  )
}

function SectionBlock({ section }: { section: ResumeSection }) {
  if (section.items.length === 0) return null
  return (
    <section style={S.section}>
      <h2 style={S.sectionTitle}>{section.title}</h2>
      {section.items.map((item, i) => (
        <ItemBlock key={i} item={item} isKeyValueSection={section.hint === 'keyvalue'} />
      ))}
    </section>
  )
}

function ItemBlock({ item, isKeyValueSection }: { item: SectionItem; isKeyValueSection: boolean }) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        const tags = item.value.split(',').map(v => v.trim()).filter(Boolean)
        return (
          <div style={S.kvSkillsRow}>
            <span style={S.kvSkillsLabel}>{item.key}</span>
            <div style={S.kvSkillsTags}>
              {tags.map(tag => (
                <span key={tag} style={S.tag}>{tag}</span>
              ))}
            </div>
          </div>
        )
      }
      return (
        <div style={S.kvRow}>
          <span style={S.kvKey}>{item.key}:</span>
          <span style={S.kvValue}>{renderInline(item.value)}</span>
        </div>
      )
    }
    case 'entry':
      return <EntryBlock entry={item} />
    case 'bullet':
      return (
        <div style={S.bulletRow}>
          <span style={S.bulletDash}>–</span>
          <span style={S.bulletText}>{renderInline(item.text)}</span>
        </div>
      )
    case 'text':
      return <p style={S.textPara}>{renderInline(item.text)}</p>
  }
}

function EntryBlock({ entry }: { entry: EntryItem }) {
  return (
    <div style={S.entry}>
      <div style={S.entryHeader}>
        <div>
          {entry.role ? (
            <span>
              <span style={S.entryRole}>{renderInline(entry.role)}</span>
              {entry.organization && (
                <span style={S.entryOrg}> @ {renderInline(entry.organization)}</span>
              )}
            </span>
          ) : (
            <span style={S.entryRole}>{renderInline(entry.heading)}</span>
          )}
        </div>
        {entry.meta.length > 0 && (
          <span style={S.entryMeta}>{entry.meta.join(' · ')}</span>
        )}
      </div>
      {entry.children.length > 0 && (
        <div style={S.entryChildren}>
          {entry.children.map((child, i) => (
            <ItemBlock key={i} item={child} isKeyValueSection={false} />
          ))}
        </div>
      )}
    </div>
  )
}
