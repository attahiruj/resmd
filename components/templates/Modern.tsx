'use client';

import React from 'react';
import type {
  TemplateProps,
  ResumeSection,
  SectionItem,
  KeyValueItem,
  EntryItem,
} from '@/types/resume';
import { DEFAULT_SETTINGS } from '@/types/resume';
import { renderInline } from '@/lib/renderInline';
import { isUrl, extractLink } from '@/lib/inline';

const FONT = "var(--font-noto-sans), 'Noto Sans', sans-serif";
const HEADER_META_KEYS = new Set(['name', 'title', 'role', 'position']);
const HEADER_ABOUT_KEYS = new Set(['about', 'summary', 'objective', 'profile']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModernStyles = Record<string, any>;

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
    entryChildren: {
      marginTop: 3,
    },
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
    footer: {
      marginTop: 20,
      borderTop: '1px solid #E8E8E8',
      paddingTop: 6,
      textAlign: 'center' as const,
    },
    footerText: { fontSize: 8, color: '#BBBBCC' },
    sidebarAbout: {
      fontSize: 8.5,
      color: '#B0B8CC',
      lineHeight: 1.6,
      marginTop: 10,
    },
  };

  const headerSection = showHeader
    ? (sections.find(
        (sec) => sec.hint === 'keyvalue' || sec.title.toLowerCase() === 'bio'
      ) ??
      sections[0] ??
      null)
    : null;

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
          <MainSectionBlock
            key={section.id}
            section={section}
            first={idx === 0}
            S={S}
          />
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
        const tags = item.value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
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

function MainSectionBlock({
  section,
  first,
  S,
}: {
  section: ResumeSection;
  first: boolean;
  S: ModernStyles;
}) {
  if (section.items.length === 0) return null;
  return (
    <section data-section={section.id}>
      <h2 style={first ? S.mainSectionTitleFirst : S.mainSectionTitle}>
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
  );
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
    case 'keyvalue': {
      if (isKeyValueSection) {
        const tags = item.value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
        return (
          <div style={S.kvSkillsRow}>
            <span style={S.kvSkillsLabel}>{item.key}:</span>
            <div style={S.kvSkillsTags}>
              {tags.map((tag) => (
                <span key={tag} style={S.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      }
      return (
        <div style={S.kvRow}>
          {isUrl(item.value) ? (
            <a
              href={item.value}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <span style={S.kvKey}>*{item.key}</span>
            </a>
          ) : (
            <>
              <span style={S.kvKey}>{item.key}:</span>
              <span style={S.kvValue}>{renderInline(item.value)}</span>
            </>
          )}
        </div>
      );
    }
    case 'entry':
      return <MainEntryBlock entry={item} S={S} />;
    case 'bullet':
      return (
        <div style={S.bulletRow}>
          <span style={S.bulletDash}>–</span>
          <span style={S.bulletText}>{renderInline(item.text)}</span>
        </div>
      );
    case 'text':
      return <p style={S.textPara}>{renderInline(item.text)}</p>;
  }
}

function MainEntryBlock({ entry, S }: { entry: EntryItem; S: ModernStyles }) {
  return (
    <div data-block="avoid" style={S.entry}>
      <div style={S.entryHeader}>
        <div>
          {entry.role ? (
            <span>
              <span style={S.entryRole}>{renderInline(entry.role)}</span>
              {entry.organization && (
                <span style={S.entryOrg}>
                  , {renderInline(entry.organization)}
                </span>
              )}
            </span>
          ) : (
            <span style={S.entryRole}>{renderInline(entry.heading)}</span>
          )}
        </div>
        {entry.meta.length > 0 && (
          <span style={S.entryMeta}>{entry.meta.join(' · ')}</span>
        )}
      </div>
      {entry.children.length > 0 && (
        <div style={S.entryChildren}>
          {entry.children.map((child, i) => (
            <MainItemBlock
              key={i}
              item={child}
              isKeyValueSection={false}
              S={S}
            />
          ))}
        </div>
      )}
    </div>
  );
}
