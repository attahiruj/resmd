'use client'

import React from 'react'
import type {
  TemplateProps,
  ResumeSection,
  SectionItem,
  KeyValueItem,
  EntryItem,
} from '@/types/resume'
import { renderInline } from '@/lib/renderInline'

const FONT = "'Courier New', Courier, monospace"
const HEADER_META_KEYS = new Set(['name', 'title', 'role', 'position'])

function isSkillsSection(section: ResumeSection): boolean {
  const lower = section.title.toLowerCase()
  return (
    section.hint === 'keyvalue' ||
    lower.includes('skill') ||
    lower.includes('tool') ||
    lower.includes('language') ||
    lower.includes('tech')
  )
}

function isProjectsSection(section: ResumeSection): boolean {
  return section.title.toLowerCase().includes('project')
}

// Styles mirror pdf/Technical.tsx 1:1 (pt → px, identical numeric values)
const S = {
  page: {
    fontFamily: FONT,
    fontSize: 9.5,
    color: '#1A1C23',
    paddingTop: 38,
    paddingBottom: 38,
    paddingLeft: 48,
    paddingRight: 48,
    lineHeight: 1.5,
    background: '#ffffff',
  },
  header: { marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 700, color: '#0A0C10', marginBottom: 2, lineHeight: 1.1 },
  jobTitle: { fontSize: 10, color: '#555870', marginBottom: 6 },
  contactRow: { display: 'flex', flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 6 },
  contactChip: {
    fontSize: 8.5,
    color: '#445577',
    backgroundColor: '#EEF0F8',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 3,
  },
  divider: { borderBottom: '1px solid #D0D4E8', marginTop: 10, marginBottom: 10 },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: '#445577',
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  skillGroupLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    color: '#778899',
    marginBottom: 3,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  skillTagsRow: { display: 'flex', flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 3 },
  skillTag: {
    fontSize: 8,
    color: '#334466',
    backgroundColor: '#F0F2F8',
    border: '1px solid #D8DCF0',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 1.5,
    paddingBottom: 1.5,
    borderRadius: 3,
  },
  entry: { marginBottom: 9 },
  entryHeader: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryRole: { fontSize: 10, fontWeight: 700, color: '#0A0C10' },
  entryOrg: { fontSize: 10, fontWeight: 400, color: '#445577' },
  entryMetaBadge: {
    fontSize: 8,
    color: '#667799',
    backgroundColor: '#EEF0F8',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 3,
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    marginLeft: 8,
  },
  entryChildren: { paddingLeft: 8, marginTop: 3, borderLeft: '1px solid #DDE0F0' },
  projectCard: {
    marginBottom: 8,
    border: '1px solid #D8DCF0',
    borderRadius: 4,
    padding: 8,
  },
  projectHeader: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  projectName: { fontSize: 10, fontWeight: 700, color: '#1A1C23' },
  projectUrl: { fontSize: 8, color: '#778899', whiteSpace: 'nowrap' as const, flexShrink: 0, marginLeft: 8 },
  bulletRow: { display: 'flex', flexDirection: 'row' as const, marginBottom: 2.5 },
  bulletDash: { fontSize: 9.5, color: '#8899BB', marginRight: 5, flexShrink: 0 },
  bulletText: { fontSize: 9.5, color: '#2A2C35', flex: 1 },
  textPara: { fontSize: 9.5, color: '#445566', marginBottom: 3, lineHeight: 1.6 },
  kvRow: { display: 'flex', flexDirection: 'row' as const, marginBottom: 3 },
  kvKey: { fontSize: 8.5, color: '#778899', fontWeight: 700, width: 62, flexShrink: 0 },
  kvValue: { fontSize: 9.5, color: '#333344', flex: 1 },
  footer: { marginTop: 16, borderTop: '1px solid #D8DCF0', paddingTop: 5, textAlign: 'center' as const },
  footerText: { fontSize: 7.5, color: '#AABBCC' },
}

export default function Technical({ resume, isPro }: TemplateProps) {
  const { sections, meta } = resume

  const headerSection =
    sections.find(s => s.hint === 'keyvalue' || s.title.toLowerCase() === 'bio') ??
    sections[0] ??
    null

  const contactItems = (headerSection?.items ?? []).filter(
    (i): i is KeyValueItem =>
      i.kind === 'keyvalue' && !HEADER_META_KEYS.has(i.key.toLowerCase()),
  )

  // Prioritize GitHub/website/portfolio at the front
  const priorityKeys = ['github', 'website', 'portfolio', 'linkedin']
  const sortedContact = [
    ...contactItems.filter(i => priorityKeys.includes(i.key.toLowerCase())),
    ...contactItems.filter(i => !priorityKeys.includes(i.key.toLowerCase())),
  ]

  const bodySections = sections.filter(s => s !== headerSection)

  return (
    <article style={S.page}>
      <header style={S.header}>
        {meta.name && <h1 style={S.name}>{meta.name}</h1>}
        {meta.title && <p style={S.jobTitle}>{meta.title}</p>}
        {sortedContact.length > 0 && (
          <div style={S.contactRow}>
            {sortedContact.map(item => (
              <span key={item.key} style={S.contactChip}>
                {item.key}: {item.value}
              </span>
            ))}
          </div>
        )}
      </header>

      <div style={S.divider} />

      {bodySections.map(section => (
        <TechSectionBlock key={section.id} section={section} />
      ))}

      {!isPro && (
        <footer style={S.footer}>
          <span style={S.footerText}>Created with resmd · resmd.app</span>
        </footer>
      )}
    </article>
  )
}

function TechSectionBlock({ section }: { section: ResumeSection }) {
  if (section.items.length === 0) return null

  if (isSkillsSection(section)) {
    const kvItems = section.items.filter((i): i is KeyValueItem => i.kind === 'keyvalue')
    if (kvItems.length > 0) {
      return (
        <section style={S.section}>
          <h2 style={S.sectionTitle}>{'// ' + section.title}</h2>
          <div style={S.skillsGrid}>
            {kvItems.map(item => {
              const tags = item.value.split(',').map(v => v.trim()).filter(Boolean)
              return (
                <div key={item.key}>
                  <p style={S.skillGroupLabel}>{item.key}</p>
                  <div style={S.skillTagsRow}>
                    {tags.map(tag => (
                      <span key={tag} style={S.skillTag}>{tag}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )
    }
  }

  if (isProjectsSection(section)) {
    const entryItems = section.items.filter((i): i is EntryItem => i.kind === 'entry')
    if (entryItems.length > 0) {
      return (
        <section style={S.section}>
          <h2 style={S.sectionTitle}>{'// ' + section.title}</h2>
          {entryItems.map((entry, i) => (
            <div key={i} style={S.projectCard}>
              <div style={S.projectHeader}>
                <span style={S.projectName}>{entry.heading.split('|')[0].trim()}</span>
                {entry.meta.length > 0 && (
                  <span style={S.projectUrl}>{entry.meta[0]}</span>
                )}
              </div>
              {entry.children.map((child, j) => (
                <TechItemBlock key={j} item={child} isKeyValueSection={false} />
              ))}
            </div>
          ))}
        </section>
      )
    }
  }

  return (
    <section style={S.section}>
      <h2 style={S.sectionTitle}>{'// ' + section.title}</h2>
      {section.items.map((item, i) => (
        <TechItemBlock key={i} item={item} isKeyValueSection={section.hint === 'keyvalue'} />
      ))}
    </section>
  )
}

function TechItemBlock({ item, isKeyValueSection }: { item: SectionItem; isKeyValueSection: boolean }) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        const tags = item.value.split(',').map(v => v.trim()).filter(Boolean)
        return (
          <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 4 }}>
            <span style={S.kvKey}>{item.key}:</span>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', flex: 1, gap: 3 }}>
              {tags.map(tag => (
                <span key={tag} style={S.skillTag}>{tag}</span>
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
      return <TechEntryBlock entry={item} />
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

function TechEntryBlock({ entry }: { entry: EntryItem }) {
  return (
    <div style={S.entry}>
      <div style={S.entryHeader}>
        <div style={{ flex: 1 }}>
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
          <span style={S.entryMetaBadge}>{entry.meta.join(' · ')}</span>
        )}
      </div>
      {entry.children.length > 0 && (
        <div style={S.entryChildren}>
          {entry.children.map((child, i) => (
            <TechItemBlock key={i} item={child} isKeyValueSection={false} />
          ))}
        </div>
      )}
    </div>
  )
}
