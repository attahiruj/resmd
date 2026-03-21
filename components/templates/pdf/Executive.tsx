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
  ResumeSection,
  SectionItem,
  EntryItem,
} from '@/types/resume';
import { DEFAULT_SETTINGS } from '@/types/resume';
import { renderInlinePdf } from '@/lib/renderInlinePdf';
import '@/lib/pdfFonts';
import { isUrl, extractLink } from '@/lib/inline';

const HEADER_META_KEYS = new Set(['name', 'title', 'role', 'position']);
const HEADER_ABOUT_KEYS = new Set(['about', 'summary', 'objective', 'profile']);

type RS = Required<typeof DEFAULT_SETTINGS>;

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
    paddingBottom: 16,
    marginBottom: 16,
  },
  name: {
    fontSize: 26,
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
  const s: RS = { ...DEFAULT_SETTINGS, ...resume.settings };

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
          <PdfSectionBlock key={section.id} section={section} s={s} />
        ))}
      </Page>
    </Document>
  );
}

function PdfSectionBlock({ section, s }: { section: ResumeSection; s: RS }) {
  if (section.items.length === 0) return null;
  return (
    <View style={styles.section}>
      <View minPresenceAhead={30}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        <View style={styles.sectionDivider} />
      </View>
      {section.items.map((item, i) => (
        <PdfItemBlock
          key={i}
          item={item}
          isKeyValueSection={section.hint === 'keyvalue'}
          s={s}
        />
      ))}
    </View>
  );
}

function PdfItemBlock({
  item,
  isKeyValueSection,
  s,
}: {
  item: SectionItem;
  isKeyValueSection: boolean;
  s: RS;
}) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        return (
          <View style={styles.kvSkillsRow}>
            <Text style={[styles.kvSkillsLabel, { fontSize: s.fontSize - 1 }]}>
              {item.key}:
            </Text>
            <Text style={[styles.kvSkillsValue, { fontSize: s.fontSize }]}>
              {item.value}
            </Text>
          </View>
        );
      }
      return (
        <View style={styles.kvRow}>
          {isUrl(item.value) ? (
            <Link
              src={item.value}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <Text style={[styles.kvKey, { fontSize: s.fontSize - 1 }]}>
                *{item.key}
              </Text>
            </Link>
          ) : (
            <>
              <Text style={[styles.kvKey, { fontSize: s.fontSize - 1 }]}>
                {item.key}:
              </Text>
              <Text style={[styles.kvValue, { fontSize: s.fontSize }]}>
                {renderInlinePdf(item.value)}
              </Text>
            </>
          )}
        </View>
      );
    }
    case 'entry':
      return <PdfEntryBlock entry={item} s={s} />;
    case 'bullet':
      return (
        <View style={styles.bulletRow}>
          <Text style={[styles.bulletDash, { fontSize: s.fontSize }]}>
            {'>'}
          </Text>
          <Text
            style={[
              styles.bulletText,
              { fontSize: s.fontSize, lineHeight: s.lineHeight },
            ]}
          >
            {renderInlinePdf(item.text)}
          </Text>
        </View>
      );
    case 'text':
      return (
        <Text style={[styles.textPara, { fontSize: s.fontSize }]}>
          {renderInlinePdf(item.text)}
        </Text>
      );
  }
}

function PdfEntryBlock({ entry, s }: { entry: EntryItem; s: RS }) {
  return (
    <View style={[styles.entry, { marginBottom: s.entrySpacing }]} wrap={false}>
      <View style={styles.entryHeader}>
        <View style={styles.entryLeft}>
          {entry.role ? (
            <Text>
              <Text style={[styles.entryRole, { fontSize: s.fontSize }]}>
                {renderInlinePdf(entry.role)}
              </Text>
              {entry.organization && (
                <Text style={[styles.entryOrg, { fontSize: s.fontSize }]}>
                  {' '}
                  – {renderInlinePdf(entry.organization)}
                </Text>
              )}
            </Text>
          ) : (
            <Text style={[styles.entryRole, { fontSize: s.fontSize }]}>
              {renderInlinePdf(entry.heading)}
            </Text>
          )}
        </View>
        {entry.meta.length > 0 && (
          <Text style={[styles.entryMeta, { fontSize: s.fontSize - 1 }]}>
            {entry.meta.join(' · ')}
          </Text>
        )}
      </View>
      {entry.children.length > 0 && (
        <View style={styles.entryChildren}>
          {entry.children.map((child, i) => (
            <PdfItemBlock
              key={i}
              item={child}
              isKeyValueSection={false}
              s={s}
            />
          ))}
        </View>
      )}
    </View>
  );
}
