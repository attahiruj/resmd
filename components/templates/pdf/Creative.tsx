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
import { parseResumeHeader, splitTagValue } from '@/lib/templateUtils';
import {
  PdfSectionBlock,
  PdfEntryBlock,
  PdfBulletRow,
  PdfTextPara,
  PdfKvRow,
} from '@/components/templates/pdf/shared';

const TEAL = '#0E7C7B';
const TEAL_LIGHT = '#E0F4F4';
const TEAL_MID = '#3BAAA9';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSans',
    fontSize: 10,
    color: '#222222',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    lineHeight: 1.5,
  },
  headerInner: {
    borderLeftWidth: 4,
    borderLeftColor: TEAL,
    paddingLeft: 12,
    marginBottom: 22,
  },
  name: {
    fontSize: 28,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: TEAL,
    lineHeight: 1.1,
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11.5,
    color: '#555555',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 6,
  },
  contactChip: {
    fontSize: 8.5,
    color: TEAL,
    backgroundColor: TEAL_LIGHT,
    paddingLeft: 7,
    paddingRight: 7,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 10,
  },
  headerAbout: {
    fontSize: 10,
    color: '#555555',
    lineHeight: 1.6,
    marginTop: 8,
  },
  section: { marginBottom: 16 },
  sectionTitleWrap: {
    marginBottom: 8,
    alignSelf: 'flex-start',
    backgroundColor: TEAL,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 3,
    paddingBottom: 3,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
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
  entryOrg: { fontSize: 10, color: TEAL_MID },
  entryMeta: { fontSize: 9, color: '#888888', marginLeft: 8 },
  entryChildren: { marginTop: 4 },
  bulletRow: { flexDirection: 'row', marginBottom: 3 },
  bulletDash: { fontSize: 10, color: TEAL, marginRight: 6, lineHeight: 1.5 },
  bulletText: { fontSize: 10, color: '#333333', flex: 1, lineHeight: 1.5 },
  textPara: {
    fontSize: 10,
    color: '#444444',
    marginBottom: 4,
    lineHeight: 1.6,
  },
  kvSkillsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    gap: 6,
  },
  kvSkillsLabel: { fontSize: 10, color: '#666666', minWidth: 60 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1 },
  tag: {
    fontSize: 8,
    color: TEAL,
    backgroundColor: TEAL_LIGHT,
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 10,
  },
  kvRow: { flexDirection: 'row', marginBottom: 3, gap: 6 },
  kvKey: { fontSize: 9, color: '#888888', width: 64 },
  kvValue: { fontSize: 10, color: '#333333', flex: 1 },
});

export default function CreativePdf({ resume }: TemplateProps) {
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
        <View style={styles.headerInner}>
          {meta.name && <Text style={styles.name}>{meta.name}</Text>}
          {meta.title && <Text style={styles.jobTitle}>{meta.title}</Text>}
          {contactEntries.length > 0 && (
            <View style={styles.contactRow}>
              {contactEntries.map((entry) =>
                entry.href ? (
                  <Link
                    key={entry.key}
                    src={entry.href}
                    style={{ textDecoration: 'none' }}
                  >
                    <Text style={styles.contactChip}>{entry.key}</Text>
                  </Link>
                ) : (
                  <Text key={entry.key} style={styles.contactChip}>
                    {entry.rawValue}
                  </Text>
                )
              )}
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
              <View style={styles.sectionTitleWrap}>
                <Text style={styles.sectionTitle}>{title}</Text>
              </View>
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
          renderSkills={(kv: KeyValueItem) => {
            const tags = splitTagValue(kv.value);
            return (
              <View style={styles.kvSkillsRow}>
                <Text style={[styles.kvSkillsLabel, { fontSize: s.fontSize }]}>
                  {kv.key}:
                </Text>
                <View style={styles.tagsRow}>
                  {tags.map((tag) => (
                    <Text key={tag} style={styles.tag}>
                      {tag}
                    </Text>
                  ))}
                </View>
              </View>
            );
          }}
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
          bullet="-"
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
