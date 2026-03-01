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

const HEADER_META_KEYS = new Set(['name', 'title', 'role', 'position'])

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1C1B18',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    lineHeight: 1.5,
  },
  // Header
  header: { marginBottom: 20 },
  name: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#1A1A1A', marginBottom: 3 },
  jobTitle: { fontSize: 11, color: '#666666', marginBottom: 6 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  contactItem: { fontSize: 9, color: '#555555' },
  contactSep: { fontSize: 9, color: '#CCCCCC', marginHorizontal: 4 },
  // Section
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#888888',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 3,
    marginBottom: 7,
  },
  // Entry
  entry: { marginBottom: 8 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryLeft: { flex: 1 },
  entryRole: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1A1A1A' },
  entryOrg: { fontSize: 10, fontFamily: 'Helvetica', color: '#444444' },
  entryMeta: { fontSize: 9, color: '#888888', marginLeft: 8 },
  entryChildren: { paddingLeft: 10, marginTop: 3, borderLeftWidth: 1, borderLeftColor: '#EEEEEE' },
  // Bullet
  bulletRow: { flexDirection: 'row', marginBottom: 2.5 },
  bulletDash: { fontSize: 10, color: '#AAAAAA', marginRight: 5, lineHeight: 1.5 },
  bulletText: { fontSize: 10, color: '#333333', flex: 1, lineHeight: 1.5 },
  // Text
  textPara: { fontSize: 10, color: '#444444', marginBottom: 4, lineHeight: 1.6 },
  // KeyValue inline
  kvRow: { flexDirection: 'row', marginBottom: 3, gap: 6 },
  kvKey: { fontSize: 9, color: '#888888', width: 60 },
  kvValue: { fontSize: 10, color: '#333333', flex: 1 },
  // KeyValue pills (skills-like)
  kvSkillsRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5, flexWrap: 'wrap' },
  kvSkillsLabel: { fontSize: 8, color: '#888888', textTransform: 'uppercase', letterSpacing: 0.5, width: 55, paddingTop: 2 },
  kvSkillsTags: { flexDirection: 'row', flexWrap: 'wrap', flex: 1, gap: 3 },
  tag: { fontSize: 8, color: '#555555', backgroundColor: '#F3F3F3', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  // Watermark footer
  footer: { marginTop: 24, borderTopWidth: 1, borderTopColor: '#E8E8E8', paddingTop: 6, textAlign: 'center' },
  footerText: { fontSize: 8, color: '#BBBBBB' },
})

type RS = Required<typeof DEFAULT_SETTINGS>

export default function MinimalPdf({ resume, isPro }: TemplateProps) {
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
          {meta.title && <Text style={styles.jobTitle}>{meta.title}</Text>}
          {contactEntries.length > 0 && (
            <View style={styles.contactRow}>
              {contactEntries.map((entry, i) => (
                <React.Fragment key={entry.key}>
                  {i > 0 && <Text style={styles.contactSep}>·</Text>}
                  {entry.href ? (
                    <Link src={entry.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <Text style={styles.contactItem}>↗ {entry.key}</Text>
                    </Link>
                  ) : (
                    <Text style={styles.contactItem}>{entry.rawValue}</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Body sections */}
        {bodySections.map(section => (
          <PdfSectionBlock key={section.id} section={section} s={s} />
        ))}

        {/* Watermark */}
        {!isPro && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Created with resmd · resmd.app</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}

function PdfSectionBlock({ section, s }: { section: ResumeSection; s: RS }) {
  if (section.items.length === 0) return null
  return (
    <View style={styles.section}>
      <View minPresenceAhead={30}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      {section.items.map((item, i) => (
        <PdfItemBlock key={i} item={item} isKeyValueSection={section.hint === 'keyvalue'} s={s} />
      ))}
    </View>
  )
}

function PdfItemBlock({
  item,
  isKeyValueSection,
  s,
}: {
  item: SectionItem
  isKeyValueSection: boolean
  s: RS
}) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        const tags = item.value.split(',').map(v => v.trim()).filter(Boolean)
        return (
          <View style={styles.kvSkillsRow}>
            <Text style={styles.kvSkillsLabel}>{item.key}</Text>
            <View style={styles.kvSkillsTags}>
              {tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text>{tag}</Text>
                </View>
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
      return <PdfEntryBlock entry={item} s={s} />
    case 'bullet':
      return (
        <View style={styles.bulletRow}>
          <Text style={[styles.bulletDash, { fontSize: s.fontSize, lineHeight: s.lineHeight }]}>–</Text>
          <Text style={[styles.bulletText, { fontSize: s.fontSize, lineHeight: s.lineHeight }]}>{renderInlinePdf(item.text)}</Text>
        </View>
      )
    case 'text':
      return <Text style={[styles.textPara, { fontSize: s.fontSize }]}>{renderInlinePdf(item.text)}</Text>
  }
}

function PdfEntryBlock({ entry, s }: { entry: EntryItem; s: RS }) {
  return (
    <View style={[styles.entry, { marginBottom: s.entrySpacing }]} wrap={false}>
      <View style={styles.entryHeader}>
        <View style={styles.entryLeft}>
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
          <Text style={[styles.entryMeta, { fontSize: s.fontSize - 1 }]}>{entry.meta.join(' · ')}</Text>
        )}
      </View>
      {entry.children.length > 0 && (
        <View style={styles.entryChildren}>
          {entry.children.map((child, i) => (
            <PdfItemBlock key={i} item={child} isKeyValueSection={false} s={s} />
          ))}
        </View>
      )}
    </View>
  )
}
