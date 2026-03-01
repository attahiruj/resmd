import React from 'react'
import { Document, Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer'
import type {
  TemplateProps,
  ResumeSection,
  SectionItem,
  KeyValueItem,
  EntryItem,
} from '@/types/resume'
import { DEFAULT_SETTINGS } from '@/types/resume'
import { renderInlinePdf } from '@/lib/renderInlinePdf'
import { isUrl, extractLink } from '@/lib/inline'

type RS = Required<typeof DEFAULT_SETTINGS>

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

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    color: '#1A1C23',
    paddingTop: 38,
    paddingBottom: 38,
    paddingLeft: 48,
    paddingRight: 48,
    lineHeight: 1.5,
  },
  header: { marginBottom: 16 },
  name: { fontSize: 22, fontFamily: 'Courier-Bold', color: '#0A0C10', marginBottom: 2 },
  jobTitle: { fontSize: 10, fontFamily: 'Courier', color: '#555870', marginBottom: 6 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  contactChip: {
    fontSize: 8.5,
    color: '#445577',
    backgroundColor: '#EEF0F8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontFamily: 'Courier',
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#D0D4E8', marginVertical: 10 },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Courier-Bold',
    color: '#445577',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitlePrefix: { color: '#8899BB' },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillGroup: { minWidth: 100, flex: 1 },
  skillGroupLabel: {
    fontSize: 7.5,
    fontFamily: 'Courier-Bold',
    color: '#778899',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skillTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  skillTag: {
    fontSize: 8,
    color: '#334466',
    backgroundColor: '#F0F2F8',
    borderWidth: 1,
    borderColor: '#D8DCF0',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    fontFamily: 'Courier',
  },
  entry: { marginBottom: 9 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryRole: { fontSize: 10, fontFamily: 'Courier-Bold', color: '#0A0C10' },
  entryOrg: { fontSize: 10, fontFamily: 'Courier', color: '#445577' },
  entryMetaBadge: {
    fontSize: 8,
    fontFamily: 'Courier',
    color: '#667799',
    backgroundColor: '#EEF0F8',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  entryChildren: { paddingLeft: 8, marginTop: 3, borderLeftWidth: 1, borderLeftColor: '#DDE0F0' },
  projectCard: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D8DCF0',
    borderRadius: 4,
    padding: 8,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  projectName: { fontSize: 10, fontFamily: 'Courier-Bold', color: '#1A1C23' },
  projectUrl: { fontSize: 8, fontFamily: 'Courier', color: '#778899' },
  bulletRow: { flexDirection: 'row', marginBottom: 2.5 },
  bulletDash: { fontSize: 9.5, color: '#8899BB', marginRight: 5 },
  bulletText: { fontSize: 9.5, color: '#2A2C35', flex: 1 },
  textPara: { fontSize: 9.5, color: '#445566', marginBottom: 3, lineHeight: 1.6 },
  kvRow: { flexDirection: 'row', marginBottom: 3 },
  kvKey: { fontSize: 8.5, color: '#778899', fontFamily: 'Courier-Bold', width: 62 },
  kvValue: { fontSize: 9.5, color: '#333344', flex: 1 },
  footer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#D8DCF0', paddingTop: 5, textAlign: 'center' },
  footerText: { fontSize: 7.5, color: '#AABBCC', fontFamily: 'Courier' },
})

export default function TechnicalPdf({ resume, isPro }: TemplateProps) {
  const { sections, meta } = resume
  const s: RS = { ...DEFAULT_SETTINGS, ...resume.settings }

  const headerSection =
    sections.find(sec => sec.hint === 'keyvalue' || sec.title.toLowerCase() === 'bio') ??
    sections[0] ??
    null

  type ContactEntry = { key: string; href: string | null; rawValue: string }
  const contactEntries: ContactEntry[] = (headerSection?.items ?? []).flatMap(item => {
    if (item.kind === 'keyvalue' && !HEADER_META_KEYS.has(item.key.toLowerCase())) {
      return [{ key: item.key, href: isUrl(item.value) ? item.value : null, rawValue: item.value }]
    }
    if (item.kind === 'text') {
      const link = extractLink(item.text)
      if (link) return [{ key: link.text, href: link.href, rawValue: link.href }]
    }
    return []
  })

  // Prioritize GitHub/website/portfolio at the front
  const priorityKeys = ['github', 'website', 'portfolio', 'linkedin']
  const sortedContact = [
    ...contactEntries.filter(e => priorityKeys.includes(e.key.toLowerCase())),
    ...contactEntries.filter(e => !priorityKeys.includes(e.key.toLowerCase())),
  ]

  const bodySections = sections.filter(sec => sec !== headerSection)

  return (
    <Document>
      <Page size="A4" style={[styles.page, {
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        paddingTop: s.marginV,
        paddingBottom: s.marginV,
        paddingLeft: s.marginH,
        paddingRight: s.marginH,
      }]}>
        {/* Header */}
        <View style={styles.header}>
          {meta.name && <Text style={styles.name}>{meta.name}</Text>}
          {meta.title && <Text style={[styles.jobTitle, { fontSize: s.fontSize + 0.5 }]}>{meta.title}</Text>}
          {sortedContact.length > 0 && (
            <View style={styles.contactRow}>
              {sortedContact.map(entry => (
                entry.href ? (
                  <Link key={entry.key} src={entry.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Text style={[styles.contactChip, { fontSize: s.fontSize - 1 }]}>↗ {entry.key}</Text>
                  </Link>
                ) : (
                  <Text key={entry.key} style={[styles.contactChip, { fontSize: s.fontSize - 1 }]}>
                    {entry.key}: {entry.rawValue}
                  </Text>
                )
              ))}
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {bodySections.map(section => (
          <TechSectionBlock key={section.id} section={section} s={s} />
        ))}

        {!isPro && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Created with resmd · resmd.app</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}

function TechSectionBlock({ section, s }: { section: ResumeSection; s: RS }) {
  if (section.items.length === 0) return null

  if (isSkillsSection(section)) {
    const kvItems = section.items.filter((i): i is KeyValueItem => i.kind === 'keyvalue')
    if (kvItems.length > 0) {
      return (
        <View style={styles.section}>
          <View minPresenceAhead={30}>
            <Text style={styles.sectionTitle}>
              {'// ' + section.title}
            </Text>
          </View>
          <View style={styles.skillsGrid}>
            {kvItems.map(item => {
              const tags = item.value.split(',').map(v => v.trim()).filter(Boolean)
              return (
                <View key={item.key} style={styles.skillGroup}>
                  <Text style={styles.skillGroupLabel}>{item.key}</Text>
                  <View style={styles.skillTagsRow}>
                    {tags.map(tag => (
                      <Text key={tag} style={[styles.skillTag, { fontSize: s.fontSize - 1.5 }]}>{tag}</Text>
                    ))}
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )
    }
  }

  if (isProjectsSection(section)) {
    const entryItems = section.items.filter((i): i is EntryItem => i.kind === 'entry')
    if (entryItems.length > 0) {
      return (
        <View style={styles.section}>
          <View minPresenceAhead={30}>
            <Text style={styles.sectionTitle}>{'// ' + section.title}</Text>
          </View>
          {entryItems.map((entry, i) => (
            <View key={i} style={[styles.projectCard, { marginBottom: s.entrySpacing }]} wrap={false}>
              <View style={styles.projectHeader}>
                <Text style={[styles.projectName, { fontSize: s.fontSize }]}>{entry.heading.split('|')[0].trim()}</Text>
                {entry.meta.length > 0 && (
                  <Text style={[styles.projectUrl, { fontSize: s.fontSize - 1.5 }]}>{entry.meta[0]}</Text>
                )}
              </View>
              {entry.children.map((child, j) => (
                <TechItemBlock key={j} item={child} isKeyValueSection={false} s={s} />
              ))}
            </View>
          ))}
        </View>
      )
    }
  }

  return (
    <View style={styles.section}>
      <View minPresenceAhead={30}>
        <Text style={styles.sectionTitle}>{'// ' + section.title}</Text>
      </View>
      {section.items.map((item, i) => (
        <TechItemBlock key={i} item={item} isKeyValueSection={section.hint === 'keyvalue'} s={s} />
      ))}
    </View>
  )
}

function TechItemBlock({ item, isKeyValueSection, s }: { item: SectionItem; isKeyValueSection: boolean; s: RS }) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        const tags = item.value.split(',').map(v => v.trim()).filter(Boolean)
        return (
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={[styles.kvKey, { fontSize: s.fontSize - 1 }]}>{item.key}:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1, gap: 3 }}>
              {tags.map(tag => (
                <Text key={tag} style={[styles.skillTag, { fontSize: s.fontSize - 1.5 }]}>{tag}</Text>
              ))}
            </View>
          </View>
        )
      }
      return (
        <View style={styles.kvRow}>
          {isUrl(item.value) ? (
            <Link src={item.value} style={{ color: 'inherit', textDecoration: 'none' }}>
              <Text style={[styles.kvKey, { fontSize: s.fontSize - 1 }]}>↗ {item.key}</Text>
            </Link>
          ) : (
            <>
              <Text style={[styles.kvKey, { fontSize: s.fontSize - 1 }]}>{item.key}:</Text>
              <Text style={[styles.kvValue, { fontSize: s.fontSize }]}>{renderInlinePdf(item.value)}</Text>
            </>
          )}
        </View>
      )
    }
    case 'entry':
      return <TechEntryBlock entry={item} s={s} />
    case 'bullet':
      return (
        <View style={styles.bulletRow}>
          <Text style={[styles.bulletDash, { fontSize: s.fontSize }]}>–</Text>
          <Text style={[styles.bulletText, { fontSize: s.fontSize }]}>{renderInlinePdf(item.text)}</Text>
        </View>
      )
    case 'text':
      return <Text style={[styles.textPara, { fontSize: s.fontSize }]}>{renderInlinePdf(item.text)}</Text>
  }
}

function TechEntryBlock({ entry, s }: { entry: EntryItem; s: RS }) {
  return (
    <View style={[styles.entry, { marginBottom: s.entrySpacing }]} wrap={false}>
      <View style={styles.entryHeader}>
        <View style={{ flex: 1 }}>
          {entry.role ? (
            <Text>
              <Text style={[styles.entryRole, { fontSize: s.fontSize }]}>{renderInlinePdf(entry.role)}</Text>
              {entry.organization && (
                <Text style={[styles.entryOrg, { fontSize: s.fontSize }]}> @ {renderInlinePdf(entry.organization)}</Text>
              )}
            </Text>
          ) : (
            <Text style={[styles.entryRole, { fontSize: s.fontSize }]}>{renderInlinePdf(entry.heading)}</Text>
          )}
        </View>
        {entry.meta.length > 0 && (
          <Text style={[styles.entryMetaBadge, { fontSize: s.fontSize - 1.5 }]}>{entry.meta.join(' · ')}</Text>
        )}
      </View>
      {entry.children.length > 0 && (
        <View style={styles.entryChildren}>
          {entry.children.map((child, i) => (
            <TechItemBlock key={i} item={child} isKeyValueSection={false} s={s} />
          ))}
        </View>
      )}
    </View>
  )
}
