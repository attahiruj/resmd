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
    color: '#1C1C1C',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    lineHeight: 1.5,
  },
  headerBox: {
    backgroundColor: '#1B2438',
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1.1,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 11,
    color: '#A8B4CC',
    marginBottom: 14,
  },
  goldLine: {
    height: 1,
    backgroundColor: '#B8973C',
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  contactItem: { fontSize: 8.5, color: '#9AAABF' },
  contactSep: {
    fontSize: 8.5,
    color: '#B8973C',
    marginHorizontal: 4,
  },
  headerAbout: {
    fontSize: 10,
    color: '#A8B4CC',
    lineHeight: 1.6,
    marginTop: 12,
  },
  section: { marginBottom: 16 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  sectionAccent: {
    width: 3,
    height: 12,
    backgroundColor: '#B8973C',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#1B2438',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E8E4D8',
    marginBottom: 8,
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
    color: '#1B2438',
  },
  entryOrg: {
    fontSize: 10,
    fontFamily: 'NotoSans',
    color: '#5A6070',
    fontStyle: 'italic',
  },
  entryMeta: { fontSize: 9, color: '#8890A8', marginLeft: 8 },
  entryChildren: { marginTop: 4 },
  bulletRow: { flexDirection: 'row', marginBottom: 2.5 },
  bulletDash: {
    fontSize: 10,
    color: '#B8973C',
    marginRight: 6,
    lineHeight: 1.5,
  },
  bulletText: { fontSize: 10, color: '#333333', flex: 1, lineHeight: 1.5 },
  textPara: {
    fontSize: 10,
    color: '#444444',
    marginBottom: 4,
    lineHeight: 1.6,
  },
  kvRow: { flexDirection: 'row', marginBottom: 3, gap: 6 },
  kvKey: { fontSize: 9, color: '#888888', width: 64 },
  kvValue: { fontSize: 10, color: '#333333', flex: 1 },
  kvSkillsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  kvSkillsLabel: {
    fontSize: 9,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: '#5A6070',
    marginRight: 8,
  },
  kvSkillsValue: { fontSize: 10, color: '#333333', flex: 1 },
});

export default function ExecutivePdf({ resume }: TemplateProps) {
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
        {/* Dark header — negative margins break out of page padding → full bleed */}
        <View
          style={[
            styles.headerBox,
            {
              marginTop: -s.marginV,
              marginLeft: -s.marginH,
              marginRight: -s.marginH,
              paddingTop: s.marginV,
              paddingBottom: Math.round(s.marginV * 0.85),
              paddingLeft: s.marginH,
              paddingRight: s.marginH,
            },
          ]}
        >
          {meta.name && <Text style={styles.name}>{meta.name}</Text>}
          {meta.title && <Text style={styles.jobTitle}>{meta.title}</Text>}
          {contactEntries.length > 0 && (
            <>
              <View style={styles.goldLine} />
              <View style={styles.contactRow}>
                {contactEntries.map((entry, i) => (
                  <React.Fragment key={entry.key}>
                    {i > 0 && <Text style={styles.contactSep}>·</Text>}
                    {entry.href ? (
                      <Link
                        src={entry.href}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        <Text style={styles.contactItem}>{entry.key}</Text>
                      </Link>
                    ) : (
                      <Text style={styles.contactItem}>{entry.rawValue}</Text>
                    )}
                  </React.Fragment>
                ))}
              </View>
            </>
          )}
          {aboutLines.map((line, i) => (
            <Text key={i} style={styles.headerAbout}>
              {line}
            </Text>
          ))}
        </View>

        {bodySections.map((section) => (
          <PdfSectionBlock
            key={section.id}
            section={section}
            styles={{ section: styles.section }}
            renderTitle={(title) => (
              <>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <View style={styles.sectionDivider} />
              </>
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
              <Text
                style={[styles.kvSkillsLabel, { fontSize: s.fontSize - 1 }]}
              >
                {kv.key}:
              </Text>
              <Text style={[styles.kvSkillsValue, { fontSize: s.fontSize }]}>
                {kv.value}
              </Text>
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
          orgSeparator=" – "
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
          bullet="•"
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
