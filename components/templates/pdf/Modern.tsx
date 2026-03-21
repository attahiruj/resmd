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
  ResumeSection,
  RequiredResumeSettings,
} from '@/types/resume';
import { DEFAULT_SETTINGS } from '@/types/resume';
import { renderInlinePdf } from '@/lib/renderInlinePdf';
import '@/lib/pdfFonts';
import { isUrl, extractLink } from '@/lib/inline';
import {
  HEADER_META_KEYS,
  HEADER_ABOUT_KEYS,
  splitTagValue,
} from '@/lib/templateUtils';
import {
  PdfEntryBlock,
  PdfBulletRow,
  PdfTextPara,
  PdfKvRow,
} from '@/components/templates/pdf/shared';

// Modern uses a two-column layout — sidebar sections are routed differently
// from main sections, so PdfSectionBlock is not used here.
function isSidebarSection(section: ResumeSection): boolean {
  const lower = section.title.toLowerCase();
  return (
    section.hint === 'keyvalue' ||
    section.hint === 'list' ||
    lower.includes('skill') ||
    lower.includes('language') ||
    lower.includes('tool') ||
    lower.includes('certification') ||
    lower === 'bio' ||
    lower === 'contact'
  );
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSans',
    fontSize: 10,
    color: '#1C1B18',
    flexDirection: 'row',
    lineHeight: 1.5,
  },
  sidebar: {
    width: '34%',
    paddingLeft: 18,
    paddingRight: 18,
  },
  sidebarName: {
    fontSize: 16,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 3,
    lineHeight: 1.2,
  },
  sidebarJobTitle: { fontSize: 9.5, color: '#B0B8CC', marginBottom: 16 },
  sidebarSectionTitle: {
    fontSize: 7,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#7A8299',
    borderBottomWidth: 1,
    borderBottomColor: '#2E3550',
    paddingBottom: 3,
    marginBottom: 6,
    marginTop: 12,
  },
  sidebarKvRow: { flexDirection: 'row', marginBottom: 3 },
  sidebarKvKey: { fontSize: 8, color: '#8890A8', width: 44 },
  sidebarKvValue: { fontSize: 8.5, color: '#D0D6E8', flex: 1 },
  sidebarBullet: { fontSize: 9, color: '#C0C8DC', marginBottom: 2.5 },
  sidebarTag: {
    fontSize: 7.5,
    color: '#C8D0E8',
    backgroundColor: '#252B3D',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    marginBottom: 3,
    marginRight: 3,
  },
  sidebarTagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  sidebarSkillLabel: {
    fontSize: 8,
    color: '#8890A8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  main: {
    flex: 1,
    paddingLeft: 24,
    paddingRight: 28,
  },
  mainSectionTitle: {
    fontSize: 8,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#4A5070',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
    paddingBottom: 3,
    marginBottom: 8,
    marginTop: 14,
  },
  entry: { marginBottom: 10 },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryLeft: { flex: 1 },
  entryRole: {
    fontSize: 10.5,
    fontFamily: 'NotoSans',
    fontWeight: 700,
    color: '#1A1A2E',
  },
  entryOrg: { fontSize: 10.5, fontFamily: 'NotoSans', color: '#444466' },
  entryMeta: { fontSize: 8.5, color: '#888899' },
  entryChildren: { marginTop: 3 },
  bulletRow: { flexDirection: 'row', marginBottom: 2.5 },
  bulletDash: { fontSize: 10, color: '#AAAACC', marginRight: 5 },
  bulletText: { fontSize: 10, color: '#333344', flex: 1 },
  textPara: {
    fontSize: 10,
    color: '#444455',
    marginBottom: 4,
    lineHeight: 1.6,
  },
  kvRow: { flexDirection: 'row', marginBottom: 3 },
  kvKey: { fontSize: 9, color: '#888899', width: 60 },
  kvValue: { fontSize: 10, color: '#333344', flex: 1 },
  kvSkillsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  kvSkillsLabel: {
    fontSize: 8,
    color: '#888899',
    marginRight: 6,
  },
  kvSkillsTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  tag: {
    fontSize: 8,
    color: '#555566',
    backgroundColor: '#F0EFF8',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  sidebarAbout: {
    fontSize: 8.5,
    color: '#B0B8CC',
    lineHeight: 1.6,
    marginTop: 10,
  },
});

export default function ModernPdf({ resume }: TemplateProps) {
  const { sections, meta } = resume;
  const s: RequiredResumeSettings = { ...DEFAULT_SETTINGS, ...resume.settings };

  // Modern has a custom header (sidebar) so we parse manually instead of using parseResumeHeader
  const headerSection =
    sections.find(
      (sec) => sec.hint === 'keyvalue' || sec.title.toLowerCase() === 'bio'
    ) ??
    sections[0] ??
    null;

  type ContactEntry = { key: string; href: string | null; rawValue: string };
  const contactEntries: ContactEntry[] = [];
  const aboutLines: string[] = [];

  for (const item of headerSection?.items ?? []) {
    if (item.kind === 'keyvalue') {
      const keyLower = item.key.toLowerCase();
      if (HEADER_META_KEYS.has(keyLower)) continue;
      if (HEADER_ABOUT_KEYS.has(keyLower)) {
        aboutLines.push(item.value);
        continue;
      }
      contactEntries.push({
        key: item.key,
        href: isUrl(item.value) ? item.value : null,
        rawValue: item.value,
      });
    } else if (item.kind === 'text') {
      const link = extractLink(item.text);
      if (link)
        contactEntries.push({
          key: link.text,
          href: link.href,
          rawValue: link.href,
        });
    }
  }

  const bodySections = sections.filter((sec) => sec !== headerSection);
  const sidebarSections = bodySections.filter(isSidebarSection);
  const mainSections = bodySections.filter((sec) => !isSidebarSection(sec));

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
          },
        ]}
      >
        {/* Sidebar background — fixed so it covers every page top-to-bottom */}
        <View
          fixed
          style={{
            position: 'absolute',
            top: -s.marginV,
            left: 0,
            bottom: -s.marginV,
            width: '34%',
            backgroundColor: '#1E2330',
          }}
        />

        {/* Sidebar content */}
        <View
          style={[styles.sidebar, { paddingLeft: Math.round(s.marginH * 0.5) }]}
        >
          {meta.name && <Text style={styles.sidebarName}>{meta.name}</Text>}
          {meta.title && (
            <Text style={styles.sidebarJobTitle}>{meta.title}</Text>
          )}

          {contactEntries.length > 0 && (
            <View>
              <Text style={styles.sidebarSectionTitle}>Contact</Text>
              {contactEntries.map((entry) => (
                <View key={entry.key} style={styles.sidebarKvRow}>
                  {entry.href ? (
                    <Link
                      src={entry.href}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      <Text style={styles.sidebarKvKey}>*{entry.key}</Text>
                    </Link>
                  ) : (
                    <Text style={styles.sidebarKvValue}>
                      {renderInlinePdf(entry.rawValue)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
          {aboutLines.map((line, i) => (
            <Text key={i} style={styles.sidebarAbout}>
              {line}
            </Text>
          ))}

          {sidebarSections.map((section) => (
            <View key={section.id}>
              <Text style={styles.sidebarSectionTitle}>{section.title}</Text>
              {section.items.map((item, i) => (
                <SidebarItemBlock
                  key={i}
                  item={item}
                  isKeyValueSection={section.hint === 'keyvalue'}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Main */}
        <View style={[styles.main, { paddingRight: s.marginH }]}>
          {mainSections.map((section, idx) => (
            <View key={section.id}>
              <View minPresenceAhead={30}>
                <Text
                  style={[
                    styles.mainSectionTitle,
                    idx === 0 ? { marginTop: 0 } : {},
                  ]}
                >
                  {section.title}
                </Text>
              </View>
              {section.items.map((item, i) => (
                <MainItemBlock
                  key={i}
                  item={item}
                  isKeyValueSection={section.hint === 'keyvalue'}
                  s={s}
                />
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

// Sidebar rendering is fully custom (dark theme, compact layout)
function SidebarItemBlock({
  item,
  isKeyValueSection,
}: {
  item: SectionItem;
  isKeyValueSection: boolean;
}) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        const tags = splitTagValue(item.value);
        return (
          <View style={{ marginBottom: 5 }}>
            <Text style={styles.sidebarSkillLabel}>{item.key}</Text>
            <View style={styles.sidebarTagsRow}>
              {tags.map((tag) => (
                <Text key={tag} style={styles.sidebarTag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        );
      }
      return (
        <View style={styles.sidebarKvRow}>
          {isUrl(item.value) ? (
            <Link
              src={item.value}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <Text style={styles.sidebarKvKey}>*{item.key}</Text>
            </Link>
          ) : (
            <>
              <Text style={styles.sidebarKvKey}>{item.key}</Text>
              <Text style={styles.sidebarKvValue}>
                {renderInlinePdf(item.value)}
              </Text>
            </>
          )}
        </View>
      );
    }
    case 'bullet':
      return (
        <Text style={styles.sidebarBullet}>· {renderInlinePdf(item.text)}</Text>
      );
    case 'text':
      return (
        <Text style={[styles.sidebarBullet, { lineHeight: 1.5 }]}>
          {renderInlinePdf(item.text)}
        </Text>
      );
    case 'entry':
      return (
        <View style={{ marginBottom: 5 }}>
          <Text
            style={{
              fontSize: 9,
              fontFamily: 'NotoSans',
              fontWeight: 700,
              color: '#D0D6E8',
            }}
          >
            {renderInlinePdf(item.role ?? item.heading)}
          </Text>
          {item.organization && (
            <Text style={styles.sidebarKvKey}>
              {renderInlinePdf(item.organization)}
            </Text>
          )}
        </View>
      );
  }
}

function MainItemBlock({
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
          renderSkills={(kv: KeyValueItem) => {
            const tags = splitTagValue(kv.value);
            return (
              <View style={styles.kvSkillsRow}>
                <Text style={[styles.kvSkillsLabel, { fontSize: s.fontSize }]}>
                  {kv.key}:
                </Text>
                <View style={styles.kvSkillsTags}>
                  {tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text>{tag}</Text>
                    </View>
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
          orgSeparator=", "
          roleFontSizeDelta={0.5}
          metaFontSizeDelta={-1.5}
          renderChildren={(child) => (
            <MainItemBlock item={child} isKeyValueSection={false} s={s} />
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
