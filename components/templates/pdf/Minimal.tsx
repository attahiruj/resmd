import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Link,
  StyleSheet,
} from '@react-pdf/renderer';
import type {
  TemplateProps,
  SectionItem,
  KeyValueItem,
  RequiredResumeSettings,
} from '@/types/resume';
import { DEFAULT_SETTINGS } from '@/types/resume';
import '@/lib/pdfFonts';
import { parseResumeHeader } from '@/lib/templateUtils';
import {
  PdfSectionBlock,
  PdfEntryBlock,
  PdfBulletRow,
  PdfTextPara,
  PdfKvRow,
} from '@/components/templates/pdf/shared';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSans',
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
  name: {
    fontSize: 24,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: '#1A1A1A',
    lineHeight: 1.1,
    marginBottom: 12,
  },
  jobTitle: { fontSize: 11, color: '#666666', marginBottom: 10 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  contactItem: { fontSize: 9, color: '#555555' },
  contactSep: { fontSize: 9, color: '#CCCCCC', marginHorizontal: 4 },
  headerAbout: {
    fontSize: 10,
    color: '#444444',
    lineHeight: 1.6,
    marginTop: 8,
  },
  // Section
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    fontWeight: 700,
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryLeft: { flex: 1 },
  entryRole: {
    fontSize: 10,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: '#1A1A1A',
  },
  entryOrg: { fontSize: 10, fontFamily: 'NotoSans', color: '#444444' },
  entryMeta: { fontSize: 9, color: '#888888', marginLeft: 8 },
  entryChildren: { marginTop: 3 },
  // Bullet
  bulletRow: { flexDirection: 'row', marginBottom: 2.5 },
  bulletDash: {
    fontSize: 10,
    color: '#AAAAAA',
    marginRight: 5,
    lineHeight: 1.5,
  },
  bulletText: { fontSize: 10, color: '#333333', flex: 1, lineHeight: 1.5 },
  // Text
  textPara: {
    fontSize: 10,
    color: '#444444',
    marginBottom: 4,
    lineHeight: 1.6,
  },
  // KeyValue inline
  kvRow: { flexDirection: 'row', marginBottom: 3, gap: 6 },
  kvKey: { fontSize: 9, color: '#888888', width: 60 },
  kvValue: { fontSize: 10, color: '#333333', flex: 1 },
  // KeyValue skills (plain)
  kvSkillsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  kvSkillsLabel: {
    fontSize: 8,
    color: '#888888',
    marginRight: 6,
  },
  kvSkillsValue: {
    fontSize: 10,
    color: '#333333',
  },
  // Watermark footer
  footer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 6,
    textAlign: 'center',
  },
  footerText: { fontSize: 8, color: '#BBBBBB' },
});

export default function MinimalPdf({ resume }: TemplateProps) {
  const { sections, meta } = resume;
  const s: RequiredResumeSettings = { ...DEFAULT_SETTINGS, ...resume.settings };
  const { contactEntries, aboutLines, bodySections } =
    parseResumeHeader(sections);

  return (
    <Document>
      <Page
        size="A4"
        style={[
          styles.page,
          {
            fontSize: s.fontSize,
            lineHeight: s.lineHeight,
            paddingTop: s.marginV,
            paddingBottom: s.marginV,
            paddingLeft: s.marginH,
            paddingRight: s.marginH,
          },
        ]}
      >
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
                    <Link
                      src={entry.href}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      <Text style={styles.contactItem}>*{entry.key}</Text>
                    </Link>
                  ) : (
                    <Text style={styles.contactItem}>{entry.rawValue}</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
          {aboutLines.map((line, i) => (
            <Text key={i} style={styles.headerAbout}>
              {line}
            </Text>
          ))}
        </View>

        {/* Body sections */}
        {bodySections.map((section) => (
          <PdfSectionBlock
            key={section.id}
            section={section}
            styles={{ section: styles.section }}
            renderTitle={(title) => (
              <Text style={styles.sectionTitle}>{title}</Text>
            )}
            renderItem={(item, isKv) => (
              <ItemBlock item={item} isKv={isKv} s={s} />
            )}
          />
        ))}
      </Page>
    </Document>
  );
}

function ItemBlock({
  item,
  isKv,
  s,
}: {
  item: SectionItem;
  isKv: boolean;
  s: RequiredResumeSettings;
}) {
  switch (item.kind) {
    case 'keyvalue':
      return (
        <PdfKvRow
          item={item}
          isKeyValueSection={isKv}
          kvStyles={{
            row: styles.kvRow,
            key: styles.kvKey,
            value: styles.kvValue,
          }}
          renderSkills={(kv: KeyValueItem) => (
            <View style={styles.kvSkillsRow}>
              <Text style={[styles.kvSkillsLabel, { fontSize: s.fontSize }]}>
                {kv.key}:
              </Text>
              <Text style={styles.kvSkillsValue}>{kv.value}</Text>
            </View>
          )}
          s={s}
        />
      );
    case 'entry':
      return (
        <PdfEntryBlock
          entry={item}
          styles={{
            entry: styles.entry,
            entryHeader: styles.entryHeader,
            entryLeft: styles.entryLeft,
            entryRole: styles.entryRole,
            entryOrg: styles.entryOrg,
            entryMeta: styles.entryMeta,
            entryChildren: styles.entryChildren,
          }}
          orgSeparator=" · "
          renderChildren={(child) => (
            <ItemBlock item={child} isKv={false} s={s} />
          )}
          s={s}
        />
      );
    case 'bullet':
      return (
        <PdfBulletRow
          text={item.text}
          bullet="–"
          styles={{
            row: styles.bulletRow,
            dash: styles.bulletDash,
            text: styles.bulletText,
          }}
          s={s}
        />
      );
    case 'text':
      return <PdfTextPara text={item.text} style={styles.textPara} s={s} />;
  }
}
