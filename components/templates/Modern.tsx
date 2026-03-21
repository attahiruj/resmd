'use client';

import React from 'react';
import type {
  TemplateProps,
  SectionItem,
  KeyValueItem,
  ResumeSection,
} from '@/types/resume';
import { DEFAULT_SETTINGS } from '@/types/resume';
import { renderInline } from '@/lib/renderInline';
import { isUrl } from '@/lib/inline';
import {
  HEADER_META_KEYS,
  HEADER_ABOUT_KEYS,
  ContactEntry,
  splitTagValue,
} from '@/lib/templateUtils';
import {
  WebEntryBlock,
  WebBulletRow,
  WebKvRow,
} from '@/components/templates/shared';

const FONT = "var(--font-noto-sans), 'Noto Sans', sans-serif";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModernStyles = Record<string, any>;

// Modern uses a two-column layout — sidebar sections are routed differently
// from main sections, so WebSectionBlock is not used here.
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

export default function Modern({ resume, showHeader = true }: TemplateProps) {
  const { sections, meta } = resume;
  const s = { ...DEFAULT_SETTINGS, ...resume.settings };

  // Styles mirror pdf/Modern.tsx 1:1 (pt → px). Dynamic values come from settings.
  const S: ModernStyles = {
    page: {
      fontFamily: FONT,
      fontSize: s.fontSize,
      color: '#1C1B18',
      display: 'flex',
      flexDirection: 'row' as const,
      lineHeight: s.lineHeight,
      background: '#ffffff',
      minHeight: '100%',
    },
    sidebar: {
      width: '30%',
      flexShrink: 0,
      backgroundColor: '#1E2330',
      paddingTop: s.marginV,
      paddingBottom: s.marginV,
      paddingLeft: s.marginH,
      paddingRight: 18,
    },
    sidebarName: {
      fontSize: 16,
      fontWeight: 700,
      color: '#FFFFFF',
      margin: 0,
      marginBottom: 3,
      lineHeight: 1.2,
    },
    sidebarJobTitle: {
      fontSize: 9.5,
      color: '#B0B8CC',
      margin: 0,
      marginBottom: 16,
    },
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
    sidebarKvRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      marginBottom: 3,
    },
    sidebarKvKey: { fontSize: 8, color: '#8890A8', width: 44, flexShrink: 0 },
    sidebarKvValue: { fontSize: 8.5, color: '#D0D6E8', flex: 1 },
    sidebarBullet: { fontSize: 9, color: '#C0C8DC', marginBottom: 2.5 },
    sidebarTagsRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
    },
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
      paddingTop: s.marginV,
      paddingBottom: s.marginV,
      paddingLeft: 24,
      paddingRight: s.marginH,
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
    entry: { marginBottom: s.entrySpacing },
    entryHeader: {
      display: 'flex',
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    entryRole: {
      fontSize: s.fontSize + 0.5,
      fontWeight: 700,
      color: '#1A1A2E',
    },
    entryOrg: { fontSize: s.fontSize + 0.5, fontWeight: 400, color: '#444466' },
    entryMeta: {
      fontSize: s.fontSize - 1.5,
      color: '#888899',
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
      marginLeft: 8,
    },
    entryChildren: { marginTop: 3 },
    bulletRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      marginBottom: 2.5,
    },
    bulletDash: {
      fontSize: s.fontSize,
      color: '#AAAACC',
      marginRight: 5,
      flexShrink: 0,
    },
    bulletText: { fontSize: s.fontSize, color: '#333344', flex: 1 },
    textPara: {
      fontSize: s.fontSize,
      color: '#444455',
      marginBottom: 4,
      lineHeight: 1.6,
    },
    kvRow: { display: 'flex', flexDirection: 'row' as const, marginBottom: 3 },
    kvKey: {
      fontSize: s.fontSize - 1,
      color: '#888899',
      width: 60,
      flexShrink: 0,
    },
    kvValue: { fontSize: s.fontSize, color: '#333344', flex: 1 },
    kvSkillsRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'flex-start',
      marginBottom: 5,
    },
    kvSkillsLabel: {
      fontSize: s.fontSize,
      color: '#888899',
      marginRight: 6,
      flexShrink: 0,
    },
    kvSkillsTags: {
      display: 'flex',
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
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
    sidebarAbout: {
      fontSize: 8.5,
      color: '#B0B8CC',
      lineHeight: 1.6,
      marginTop: 10,
    },
  };

  // Modern has a custom header (sidebar) so we parse manually instead of using parseResumeHeader
  const headerSection = showHeader
    ? (sections.find(
        (sec) => sec.hint === 'keyvalue' || sec.title.toLowerCase() === 'bio'
      ) ??
      sections[0] ??
      null)
    : null;

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
    }
  }

  const bodySections = sections.filter((sec) => sec !== headerSection);
  const sidebarSections = bodySections.filter(isSidebarSection);
  const mainSections = bodySections.filter((sec) => !isSidebarSection(sec));

  return (
    <article style={S.page}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        {showHeader && (
          <div data-header>
            {meta.name && <h1 style={S.sidebarName}>{meta.name}</h1>}
            {meta.title && <p style={S.sidebarJobTitle}>{meta.title}</p>}
            {contactEntries.length > 0 && (
              <div>
                <h2 style={S.sidebarSectionTitle}>Contact</h2>
                {contactEntries.map((entry) => (
                  <div key={entry.key} style={S.sidebarKvRow}>
                    {entry.href ? (
                      <a
                        href={entry.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        <span style={S.sidebarKvKey}>*{entry.key}</span>
                      </a>
                    ) : (
                      <span style={S.sidebarKvValue}>
                        {renderInline(entry.rawValue)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {aboutLines.map((line, i) => (
              <p
                key={i}
                style={{ ...S.sidebarAbout, margin: 0, marginTop: 10 }}
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {sidebarSections.map((section) => (
          <div key={section.id} data-section={section.id}>
            <h2 style={S.sidebarSectionTitle}>{section.title}</h2>
            {section.items.map((item, i) => (
              <SidebarItemBlock
                key={i}
                item={item}
                isKeyValueSection={section.hint === 'keyvalue'}
                S={S}
              />
            ))}
          </div>
        ))}
      </aside>

      {/* Main */}
      <main style={S.main}>
        {mainSections.map((section, idx) => (
          <section key={section.id} data-section={section.id}>
            <h2
              style={idx === 0 ? S.mainSectionTitleFirst : S.mainSectionTitle}
            >
              {section.title}
            </h2>
            {section.items.map((item, i) => (
              <MainItemBlock
                key={i}
                item={item}
                isKeyValueSection={section.hint === 'keyvalue'}
                S={S}
              />
            ))}
          </section>
        ))}
      </main>
    </article>
  );
}

function SidebarItemBlock({
  item,
  isKeyValueSection,
  S,
}: {
  item: SectionItem;
  isKeyValueSection: boolean;
  S: ModernStyles;
}) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        const tags = splitTagValue(item.value);
        return (
          <div style={{ marginBottom: 5 }}>
            <p style={S.sidebarSkillLabel}>{item.key}</p>
            <div style={S.sidebarTagsRow}>
              {tags.map((tag) => (
                <span key={tag} style={S.sidebarTag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      }
      return (
        <div style={S.sidebarKvRow}>
          {isUrl(item.value) ? (
            <a
              href={item.value}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <span style={S.sidebarKvKey}>*{item.key}</span>
            </a>
          ) : (
            <>
              <span style={S.sidebarKvKey}>{item.key}</span>
              <span style={S.sidebarKvValue}>{renderInline(item.value)}</span>
            </>
          )}
        </div>
      );
    }
    case 'bullet':
      return <p style={S.sidebarBullet}>· {renderInline(item.text)}</p>;
    case 'text':
      return (
        <p style={{ ...S.sidebarBullet, lineHeight: 1.5 }}>
          {renderInline(item.text)}
        </p>
      );
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
      );
  }
}

function MainItemBlock({
  item,
  isKeyValueSection,
  S,
}: {
  item: SectionItem;
  isKeyValueSection: boolean;
  S: ModernStyles;
}) {
  switch (item.kind) {
    case 'keyvalue':
      return (
        <WebKvRow
          item={item}
          isKeyValueSection={isKeyValueSection}
          kvStyles={{ row: S.kvRow, key: S.kvKey, value: S.kvValue }}
          renderSkills={(kv: KeyValueItem) => {
            const tags = splitTagValue(kv.value);
            return (
              <div style={S.kvSkillsRow}>
                <span style={S.kvSkillsLabel}>{kv.key}:</span>
                <div style={S.kvSkillsTags}>
                  {tags.map((tag) => (
                    <span key={tag} style={S.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          }}
        />
      );
    case 'entry':
      return (
        <WebEntryBlock
          entry={item}
          styles={{
            entry: S.entry,
            entryHeader: S.entryHeader,
            entryRole: S.entryRole,
            entryOrg: S.entryOrg,
            entryMeta: S.entryMeta,
            entryChildren: S.entryChildren,
          }}
          orgSeparator=", "
          renderChildren={(child) => (
            <MainItemBlock item={child} isKeyValueSection={false} S={S} />
          )}
        />
      );
    case 'bullet':
      return (
        <WebBulletRow
          text={item.text}
          bullet="–"
          styles={{
            row: S.bulletRow,
            dash: S.bulletDash,
            text: S.bulletText,
          }}
        />
      );
    case 'text':
      return <p style={S.textPara}>{renderInline(item.text)}</p>;
  }
}
