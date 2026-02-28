import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type {
  TemplateProps,
  ResumeSection,
  SectionItem,
  KeyValueItem,
  EntryItem,
} from '@/types/resume'
import { renderInlinePdf } from '@/lib/renderInlinePdf'

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

export default function MinimalPdf({ resume, isPro }: TemplateProps) {
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
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {meta.name && <Text style={styles.name}>{meta.name}</Text>}
          {meta.title && <Text style={styles.jobTitle}>{meta.title}</Text>}
          {contactItems.length > 0 && (
            <View style={styles.contactRow}>
              {contactItems.map((item, i) => (
                <React.Fragment key={item.key}>
                  {i > 0 && <Text style={styles.contactSep}>·</Text>}
                  <Text style={styles.contactItem}>{item.value}</Text>
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Body sections */}
        {bodySections.map(section => (
          <PdfSectionBlock key={section.id} section={section} />
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

function PdfSectionBlock({ section }: { section: ResumeSection }) {
  if (section.items.length === 0) return null
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.items.map((item, i) => (
        <PdfItemBlock key={i} item={item} isKeyValueSection={section.hint === 'keyvalue'} />
      ))}
    </View>
  )
}

function PdfItemBlock({
  item,
  isKeyValueSection,
}: {
  item: SectionItem
  isKeyValueSection: boolean
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
          <Text style={styles.kvKey}>{item.key}:</Text>
          <Text style={styles.kvValue}>{renderInlinePdf(item.value)}</Text>
        </View>
      )
    }
    case 'entry':
      return <PdfEntryBlock entry={item} />
    case 'bullet':
      return (
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDash}>–</Text>
          <Text style={styles.bulletText}>{renderInlinePdf(item.text)}</Text>
        </View>
      )
    case 'text':
      return <Text style={styles.textPara}>{renderInlinePdf(item.text)}</Text>
  }
}

function PdfEntryBlock({ entry }: { entry: EntryItem }) {
  return (
    <View style={styles.entry}>
      <View style={styles.entryHeader}>
        <View style={styles.entryLeft}>
          {entry.role ? (
            <Text>
              <Text style={styles.entryRole}>{renderInlinePdf(entry.role)}</Text>
              {entry.organization && (
                <Text style={styles.entryOrg}> @ {renderInlinePdf(entry.organization)}</Text>
              )}
            </Text>
          ) : (
            <Text style={styles.entryRole}>{renderInlinePdf(entry.heading)}</Text>
          )}
        </View>
        {entry.meta.length > 0 && (
          <Text style={styles.entryMeta}>{entry.meta.join(' · ')}</Text>
        )}
      </View>
      {entry.children.length > 0 && (
        <View style={styles.entryChildren}>
          {entry.children.map((child, i) => (
            <PdfItemBlock key={i} item={child} isKeyValueSection={false} />
          ))}
        </View>
      )}
    </View>
  )
}
