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
  EntryItem,
  ResumeSection,
  RequiredResumeSettings,
} from '@/types/resume';
import { DEFAULT_SETTINGS } from '@/types/resume';
import { renderInlinePdf } from '@/lib/renderInlinePdf';
import '@/lib/pdfFonts';
import { isUrl } from '@/lib/inline';
import {
  parseResumeHeader,
  sortContactsByPriority,
  splitTagValue,
} from '@/lib/templateUtils';
import {
  PdfSectionBlock,
  PdfEntryBlock,
  PdfBulletRow,
  PdfTextPara,
  PdfKvRow,
} from '@/components/templates/pdf/shared';

function isSkillsSection(section: ResumeSection): boolean {
  const lower = section.title.toLowerCase();
  return (
    section.hint === 'keyvalue' ||
    lower.includes('skill') ||
    lower.includes('tool') ||
    lower.includes('language') ||
    lower.includes('tech')
  );
}

function isProjectsSection(section: ResumeSection): boolean {
  return section.title.toLowerCase().includes('project');
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'CourierPrime',
    fontSize: 9.5,
    color: '#1A1C23',
    paddingTop: 38,
    paddingBottom: 38,
    paddingLeft: 48,
    paddingRight: 48,
    lineHeight: 1.5,
  },
  header: { marginBottom: 16 },
  name: {
    fontSize: 22,
    fontFamily: 'CourierPrime',
    fontWeight: 700,
    color: '#0A0C10',
    marginBottom: 2,
    lineHeight: 1.1,
  },
  jobTitle: {
    fontSize: 10,
    fontFamily: 'CourierPrime',
    color: '#555870',
    marginBottom: 6,
  },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  contactChip: {
    fontSize: 8.5,
    color: '#445577',
    backgroundColor: '#EEF0F8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontFamily: 'CourierPrime',
  },
  headerAbout: {
    fontSize: 9.5,
    color: '#445566',
    lineHeight: 1.6,
    marginTop: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D0D4E8',
    marginVertical: 10,
  },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'CourierPrime',
    fontWeight: 700,
    color: '#445577',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  skillsGrid: { flexDirection: 'column', gap: 4 },
  skillGroupLabel: {
    fontSize: 7.5,
    fontFamily: 'CourierPrime',
    fontWeight: 700,
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
    fontFamily: 'CourierPrime',
  },
  entry: { marginBottom: 9 },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryLeft: { flex: 1 },
  entryRole: {
    fontSize: 10,
    fontFamily: 'NotoSansMono',
    fontWeight: 700,
    color: '#0A0C10',
  },
  entryOrg: { fontSize: 10, fontFamily: 'NotoSansMono', color: '#445577' },
  entryMetaBadge: {
    fontSize: 8,
    fontFamily: 'CourierPrime',
    color: '#667799',
    marginLeft: 8,
  },
  entryChildren: { marginTop: 3 },
  projectCard: { marginBottom: 8 },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  projectName: {
    fontSize: 10,
    fontFamily: 'NotoSansMono',
    fontWeight: 700,
    color: '#1A1C23',
  },
  projectUrl: { fontSize: 8, fontFamily: 'NotoSansMono', color: '#778899' },
  bulletRow: { flexDirection: 'row', marginBottom: 2.5 },
  bulletDash: { fontSize: 9.5, color: '#8899BB', marginRight: 5 },
  bulletText: { fontSize: 9.5, color: '#2A2C35', flex: 1 },
  textPara: {
    fontSize: 9.5,
    color: '#445566',
    marginBottom: 3,
    lineHeight: 1.6,
  },
  kvRow: { flexDirection: 'row', marginBottom: 3 },
  kvKey: {
    fontSize: 8.5,
    color: '#778899',
    fontFamily: 'CourierPrime',
    fontWeight: 700,
    width: 62,
  },
  kvSkillsKey: {
    fontSize: 8.5,
    color: '#778899',
    fontFamily: 'CourierPrime',
    fontWeight: 700,
    marginRight: 6,
  },
  kvValue: { fontSize: 9.5, color: '#333344', flex: 1 },
  footer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#D8DCF0',
    paddingTop: 5,
    textAlign: 'center',
  },
  footerText: { fontSize: 7.5, color: '#AABBCC', fontFamily: 'NotoSansMono' },
});

export default function TechnicalPdf({ resume }: TemplateProps) {
  const { sections, meta } = resume;
  const s: RequiredResumeSettings = { ...DEFAULT_SETTINGS, ...resume.settings };
  const { contactEntries, aboutLines, bodySections } =
    parseResumeHeader(sections);
  const sortedContact = sortContactsByPriority(contactEntries);

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
          {meta.title && (
            <Text style={[styles.jobTitle, { fontSize: s.fontSize + 0.5 }]}>
              {meta.title}
            </Text>
          )}
          {sortedContact.length > 0 && (
            <View style={styles.contactRow}>
              {sortedContact.map((entry) =>
                entry.href ? (
                  <Link
                    key={entry.key}
                    src={entry.href}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    <Text
                      style={[styles.contactChip, { fontSize: s.fontSize - 1 }]}
                    >
                      *{entry.key}
                    </Text>
                  </Link>
                ) : (
                  <Text
                    key={entry.key}
                    style={[styles.contactChip, { fontSize: s.fontSize - 1 }]}
                  >
                    {entry.rawValue}
                  </Text>
                )
              )}
            </View>
          )}
          {aboutLines.map((line, i) => (
            <Text
              key={i}
              style={[styles.headerAbout, { fontSize: s.fontSize }]}
            >
              {line}
            </Text>
          ))}
        </View>

        <View style={styles.divider} />

        {bodySections.map((section) => (
          <TechSectionBlock key={section.id} section={section} s={s} />
        ))}
      </Page>
    </Document>
  );
}

// Skills rows rendered as plain "key: value1, value2" text lines
function SkillRow({
  item,
  s,
}: {
  item: KeyValueItem;
  s: RequiredResumeSettings;
}) {
  return (
    <Text style={{ fontSize: s.fontSize, color: '#333344', marginBottom: 3 }}>
      <Text style={[styles.kvKey, { fontSize: s.fontSize - 1 }]}>
        {item.key}:{' '}
      </Text>
      {splitTagValue(item.value).join(', ')}
    </Text>
  );
}

// Technical has custom section handling for skills and projects sections.
// Regular sections delegate to PdfSectionBlock (which guarantees minPresenceAhead).
function TechSectionBlock({
  section,
  s,
}: {
  section: ResumeSection;
  s: RequiredResumeSettings;
}) {
  if (section.items.length === 0) return null;

  if (isSkillsSection(section)) {
    const kvItems = section.items.filter(
      (i): i is KeyValueItem => i.kind === 'keyvalue'
    );
    if (kvItems.length > 0) {
      return (
        <View style={styles.section}>
          <View style={styles.skillsGrid}>
            <View wrap={false}>
              <Text style={styles.sectionTitle}>{'// ' + section.title}</Text>
              {kvItems[0] && <SkillRow item={kvItems[0]} s={s} />}
            </View>
            {kvItems.slice(1).map((item) => (
              <SkillRow key={item.key} item={item} s={s} />
            ))}
          </View>
        </View>
      );
    }
  }

  if (isProjectsSection(section)) {
    const entryItems = section.items.filter(
      (i): i is EntryItem => i.kind === 'entry'
    );
    if (entryItems.length > 0) {
      const renderProjectEntry = (entry: EntryItem, key: number) => (
        <View
          key={key}
          style={[styles.projectCard, { marginBottom: s.entrySpacing }]}
          wrap={false}
        >
          <View style={styles.projectHeader}>
            <Text style={[styles.projectName, { fontSize: s.fontSize }]}>
              {entry.heading.split('|')[0].trim()}
            </Text>
            {entry.meta.length > 0 && (
              <Text style={[styles.projectUrl, { fontSize: s.fontSize - 1.5 }]}>
                {entry.meta[0]}
              </Text>
            )}
          </View>
          {entry.children.map((child, j) => (
            <TechItemBlock
              key={j}
              item={child}
              isKeyValueSection={false}
              s={s}
            />
          ))}
        </View>
      );
      return (
        <View style={styles.section}>
          <View wrap={false}>
            <Text style={styles.sectionTitle}>{'// ' + section.title}</Text>
            {entryItems[0] && renderProjectEntry(entryItems[0], 0)}
          </View>
          {entryItems
            .slice(1)
            .map((entry, i) => renderProjectEntry(entry, i + 1))}
        </View>
      );
    }
  }

  // Regular sections — use PdfSectionBlock for guaranteed minPresenceAhead
  return (
    <PdfSectionBlock
      section={section}
      styles={{ section: styles.section }}
      renderTitle={(title) => (
        <Text style={styles.sectionTitle}>{'// ' + title}</Text>
      )}
      renderItem={(item, isKv) => (
        <TechItemBlock item={item} isKeyValueSection={isKv} s={s} />
      )}
    />
  );
}

function TechItemBlock({
  item,
  isKeyValueSection,
  s,
}: {
  item: SectionItem;
  isKeyValueSection: boolean;
  s: RequiredResumeSettings;
}) {
  switch (item.kind) {
    case 'keyvalue':
      return (
        <PdfKvRow
          item={item}
          isKeyValueSection={isKeyValueSection}
          kvStyles={{
            row: styles.kvRow,
            key: styles.kvKey,
            value: styles.kvValue,
          }}
          renderSkills={(kv: KeyValueItem) => (
            <View style={styles.kvRow}>
              <Text style={[styles.kvSkillsKey, { fontSize: s.fontSize }]}>
                {kv.key}:
              </Text>
              <Text style={[styles.kvValue, { fontSize: s.fontSize }]}>
                {splitTagValue(kv.value).join(', ')}
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
            entryMeta: styles.entryMetaBadge,
            entryChildren: styles.entryChildren,
          }}
          orgSeparator=" @ "
          metaFontSizeDelta={-1.5}
          renderChildren={(child) => (
            <TechItemBlock item={child} isKeyValueSection={false} s={s} />
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
