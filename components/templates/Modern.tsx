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

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const HEADER_META_KEYS = new Set(['name', 'title', 'role', 'position'])

function isSidebarSection(section: ResumeSection): boolean {
  const lower = section.title.toLowerCase()
  return (
    section.hint === 'keyvalue' ||
    section.hint === 'list' ||
    lower.includes('skill') ||
    lower.includes('language') ||
    lower.includes('tool') ||
    lower.includes('certification') ||
    lower === 'bio' ||
    lower === 'contact'
  )
}

// Styles mirror pdf/Modern.tsx 1:1 (pt → px, identical numeric values)
const S = {
  page: {
    fontFamily: FONT,
    fontSize: 10,
    color: '#1C1B18',
    display: 'flex',
    flexDirection: 'row' as const,
    lineHeight: 1.5,
    background: '#ffffff',
    minHeight: '100%',
  },
  sidebar: {
    width: '30%',
    flexShrink: 0,
    backgroundColor: '#1E2330',
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 18,
    paddingRight: 18,
  },
  sidebarName: { fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 3, lineHeight: 1.2 },
  sidebarJobTitle: { fontSize: 9.5, color: '#B0B8CC', marginBottom: 16 },
  sidebarSectionTitle: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: '#7A8299',
    borderBottom: '1px solid #2E3550',
    paddingBottom: 3,
    marginBottom: 6,
    marginTop: 12,
  },
  sidebarKvRow: { display: 'flex', flexDirection: 'row' as const, marginBottom: 3 },
  sidebarKvKey: { fontSize: 8, color: '#8890A8', width: 44, flexShrink: 0 },
  sidebarKvValue: { fontSize: 8.5, color: '#D0D6E8', flex: 1 },
  sidebarBullet: { fontSize: 9, color: '#C0C8DC', marginBottom: 2.5 },
  sidebarTagsRow: { display: 'flex', flexDirection: 'row' as const, flexWrap: 'wrap' as const },
  sidebarTag: {
    fontSize: 7.5,
    color: '#C8D0E8',
    backgroundColor: '#252B3D',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 3,
    marginBottom: 3,
    marginRight: 3,
  },
  sidebarSkillLabel: {
    fontSize: 8,
    color: '#8890A8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: 2,
  },
  main: {
    flex: 1,
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 24,
    paddingRight: 28,
  },
  mainSectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: '#4A5070',
    borderBottom: '1px solid #E8E6E0',
    paddingBottom: 3,
    marginBottom: 8,
    marginTop: 14,
  },
  mainSectionTitleFirst: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: '#4A5070',
    borderBottom: '1px solid #E8E6E0',
    paddingBottom: 3,
    marginBottom: 8,
    marginTop: 0,
  },
  entry: { marginBottom: 10 },
  entryHeader: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryRole: { fontSize: 10.5, fontWeight: 700, color: '#1A1A2E' },
  entryOrg: { fontSize: 10.5, fontWeight: 400, color: '#444466' },
  entryMeta: { fontSize: 8.5, color: '#888899', whiteSpace: 'nowrap' as const, flexShrink: 0, marginLeft: 8 },
  entryChildren: { paddingLeft: 8, marginTop: 3, borderLeft: '1px solid #EEECFF' },
  bulletRow: { display: 'flex', flexDirection: 'row' as const, marginBottom: 2.5 },
  bulletDash: { fontSize: 10, color: '#AAAACC', marginRight: 5, flexShrink: 0 },
  bulletText: { fontSize: 10, color: '#333344', flex: 1 },
  textPara: { fontSize: 10, color: '#444455', marginBottom: 4, lineHeight: 1.6 },
  kvRow: { display: 'flex', flexDirection: 'row' as const, marginBottom: 3 },
  kvKey: { fontSize: 9, color: '#888899', width: 60, flexShrink: 0 },
  kvValue: { fontSize: 10, color: '#333344', flex: 1 },
  kvSkillsRow: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  kvSkillsLabel: {
    fontSize: 8,
    color: '#888899',
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
    color: '#555566',
    backgroundColor: '#F0EFF8',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 3,
  },
  footer: { marginTop: 20, borderTop: '1px solid #E8E8E8', paddingTop: 6, textAlign: 'center' as const },
  footerText: { fontSize: 8, color: '#BBBBCC' },
}

export default function Modern({ resume, isPro }: TemplateProps) {
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
  const sidebarSections = bodySections.filter(isSidebarSection)
  const mainSections = bodySections.filter(s => !isSidebarSection(s))

  return (
    <article style={S.page}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        {meta.name && <h1 style={S.sidebarName}>{meta.name}</h1>}
        {meta.title && <p style={S.sidebarJobTitle}>{meta.title}</p>}

        {contactItems.length > 0 && (
          <div>
            <h2 style={S.sidebarSectionTitle}>Contact</h2>
            {contactItems.map(item => (
              <div key={item.key} style={S.sidebarKvRow}>
                <span style={S.sidebarKvKey}>{item.key}</span>
                <span style={S.sidebarKvValue}>{renderInline(item.value)}</span>
              </div>
            ))}
          </div>
        )}

        {sidebarSections.map(section => (
          <div key={section.id}>
            <h2 style={S.sidebarSectionTitle}>{section.title}</h2>
            {section.items.map((item, i) => (
              <SidebarItemBlock key={i} item={item} isKeyValueSection={section.hint === 'keyvalue'} />
            ))}
          </div>
        ))}
      </aside>

      {/* Main */}
      <main style={S.main}>
        {mainSections.map((section, idx) => (
          <MainSectionBlock key={section.id} section={section} first={idx === 0} />
        ))}

        {!isPro && (
          <footer style={S.footer}>
            <span style={S.footerText}>Created with resmd · resmd.app</span>
          </footer>
        )}
      </main>
    </article>
  )
}

function SidebarItemBlock({ item, isKeyValueSection }: { item: SectionItem; isKeyValueSection: boolean }) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        const tags = item.value.split(',').map(v => v.trim()).filter(Boolean)
        return (
          <div style={{ marginBottom: 5 }}>
            <p style={S.sidebarSkillLabel}>{item.key}</p>
            <div style={S.sidebarTagsRow}>
              {tags.map(tag => (
                <span key={tag} style={S.sidebarTag}>{tag}</span>
              ))}
            </div>
          </div>
        )
      }
      return (
        <div style={S.sidebarKvRow}>
          <span style={S.sidebarKvKey}>{item.key}</span>
          <span style={S.sidebarKvValue}>{renderInline(item.value)}</span>
        </div>
      )
    }
    case 'bullet':
      return <p style={S.sidebarBullet}>· {renderInline(item.text)}</p>
    case 'text':
      return <p style={{ ...S.sidebarBullet, lineHeight: 1.5 }}>{renderInline(item.text)}</p>
    case 'entry':
      return (
        <div style={{ marginBottom: 5 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: '#D0D6E8' }}>
            {renderInline(item.role ?? item.heading)}
          </p>
          {item.organization && (
            <p style={S.sidebarKvKey}>{renderInline(item.organization)}</p>
          )}
        </div>
      )
  }
}

function MainSectionBlock({ section, first }: { section: ResumeSection; first: boolean }) {
  if (section.items.length === 0) return null
  return (
    <section>
      <h2 style={first ? S.mainSectionTitleFirst : S.mainSectionTitle}>{section.title}</h2>
      {section.items.map((item, i) => (
        <MainItemBlock key={i} item={item} isKeyValueSection={section.hint === 'keyvalue'} />
      ))}
    </section>
  )
}

function MainItemBlock({ item, isKeyValueSection }: { item: SectionItem; isKeyValueSection: boolean }) {
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
      return <MainEntryBlock entry={item} />
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

function MainEntryBlock({ entry }: { entry: EntryItem }) {
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
            <MainItemBlock key={i} item={child} isKeyValueSection={false} />
          ))}
        </div>
      )}
    </div>
  )
}
