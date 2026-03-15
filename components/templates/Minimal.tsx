'use client';

import React from 'react';
import type {
  TemplateProps,
  ResumeSection,
  SectionItem,
  EntryItem,
  KeyValueItem,
} from '@/types/resume';
import { DEFAULT_SETTINGS } from '@/types/resume';
import { renderInline } from '@/lib/renderInline';
import { isUrl, extractLink } from '@/lib/inline';

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const HEADER_META_KEYS = new Set(['name', 'title', 'role', 'position']);
const HEADER_ABOUT_KEYS = new Set(['about', 'summary', 'objective', 'profile']);

export default function Minimal({
  resume,
  isPro,
  showHeader = true,
}: TemplateProps) {
  const { sections, meta } = resume;
  const s = { ...DEFAULT_SETTINGS, ...resume.settings };

  // Styles mirror pdf/Minimal.tsx 1:1 (pt → px). Dynamic values come from settings.
  const S = {
    page: {
      fontFamily: FONT,
      fontSize: s.fontSize,
      color: '#1C1B18',
      paddingTop: s.marginV,
      paddingBottom: s.marginV,
      paddingLeft: s.marginH,
      paddingRight: s.marginH,
      lineHeight: s.lineHeight,
      background: '#ffffff',
    },
    header: { marginBottom: 20 },
    name: {
      fontSize: 24,
      fontWeight: 700,
      color: '#1A1A1A',
      margin: 0,
      marginBottom: 12,
      lineHeight: 1.1,
    },
    jobTitle: { fontSize: 11, color: '#666666', margin: 0, marginBottom: 10 },
    contactRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 4,
    },
    contactItem: { fontSize: 9, color: '#555555' },
    contactSep: {
      fontSize: 9,
      color: '#CCCCCC',
      marginLeft: 4,
      marginRight: 4,
    },
    section: { marginBottom: 14 },
    sectionTitle: {
      fontSize: 7.5,
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '1.2px',
      color: '#888888',
      borderBottom: '1px solid #E0E0E0',
      paddingBottom: 3,
      marginBottom: 7,
    },
    entry: { marginBottom: s.entrySpacing },
    entryHeader: {
      display: 'flex',
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    entryRole: { fontSize: s.fontSize, fontWeight: 700, color: '#1A1A1A' },
    entryOrg: { fontSize: s.fontSize, fontWeight: 400, color: '#444444' },
    entryMeta: {
      fontSize: s.fontSize - 1,
      color: '#888888',
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
      marginLeft: 8,
    },
    entryChildren: {
      paddingLeft: 10,
      marginTop: 3,
      borderLeft: '1px solid #EEEEEE',
    },
    bulletRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      marginBottom: 2.5,
    },
    bulletDash: {
      fontSize: s.fontSize,
      color: '#AAAAAA',
      marginRight: 5,
      lineHeight: s.lineHeight,
      flexShrink: 0,
    },
    bulletText: {
      fontSize: s.fontSize,
      color: '#333333',
      flex: 1,
      lineHeight: s.lineHeight,
    },
    textPara: {
      fontSize: s.fontSize,
      color: '#444444',
      marginBottom: 4,
      lineHeight: 1.6,
    },
    kvRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      marginBottom: 3,
      gap: 6,
    },
    kvKey: {
      fontSize: s.fontSize - 1,
      color: '#888888',
      width: 60,
      flexShrink: 0,
    },
    kvValue: { fontSize: s.fontSize, color: '#333333', flex: 1 },
    kvSkillsRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'baseline',
      marginBottom: 4,
    },
    kvSkillsLabel: {
      fontSize: 8,
      color: '#888888',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      width: 80,
      flexShrink: 0,
    },
    kvSkillsValue: {
      fontSize: s.fontSize,
      color: '#333333',
      flex: 1,
    },
    headerAbout: {
      fontSize: s.fontSize,
      color: '#444444',
      lineHeight: 1.6,
      marginTop: 8,
    },
    footer: {
      marginTop: 24,
      borderTop: '1px solid #E8E8E8',
      paddingTop: 6,
      textAlign: 'center' as const,
    },
    footerText: { fontSize: 8, color: '#BBBBBB' },
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

  return (
    <article style={S.page}>
      {showHeader && (
        <header data-header style={S.header}>
          {meta.name && <h1 style={S.name}>{meta.name}</h1>}
          {meta.title && <p style={S.jobTitle}>{meta.title}</p>}
          {contactEntries.length > 0 && (
            <div style={S.contactRow}>
              {contactEntries.map((entry, i) => (
                <React.Fragment key={entry.key}>
                  {i > 0 && <span style={S.contactSep}>·</span>}
                  {entry.href ? (
                    <a
                      href={entry.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      <span style={S.contactItem}>↗ {entry.key}</span>
                    </a>
                  ) : (
                    <span style={S.contactItem}>{entry.rawValue}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          {aboutLines.map((line, i) => (
            <p key={i} style={{ ...S.headerAbout, margin: 0, marginTop: 8 }}>
              {line}
            </p>
          ))}
        </header>
      )}

      {bodySections.map((section) => (
        <SectionBlock key={section.id} section={section} S={S} />
      ))}

      {!isPro && (
        <footer style={S.footer}>
          <span style={S.footerText}>Created with resmd · resmd.app</span>
        </footer>
      )}
    </article>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MinimalStyles = Record<string, any>;

function SectionBlock({
  section,
  S,
}: {
  section: ResumeSection;
  S: MinimalStyles;
}) {
  if (section.items.length === 0) return null;
  return (
    <section data-section={section.id} style={S.section}>
      <h2 style={S.sectionTitle}>{section.title}</h2>
      {section.items.map((item, i) => (
        <ItemBlock
          key={i}
          item={item}
          isKeyValueSection={section.hint === 'keyvalue'}
          S={S}
        />
      ))}
    </section>
  );
}

function ItemBlock({
  item,
  isKeyValueSection,
  S,
}: {
  item: SectionItem;
  isKeyValueSection: boolean;
  S: MinimalStyles;
}) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        return (
          <div style={S.kvSkillsRow}>
            <span style={S.kvSkillsLabel}>{item.key}</span>
            <span style={S.kvSkillsValue}>{item.value}</span>
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
              <span style={S.kvKey}>↗ {item.key}</span>
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
      return <EntryBlock entry={item} S={S} />;
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

function EntryBlock({ entry, S }: { entry: EntryItem; S: MinimalStyles }) {
  return (
    <div data-block="avoid" style={S.entry}>
      <div style={S.entryHeader}>
        <div>
          {entry.role ? (
            <span>
              <span style={S.entryRole}>{renderInline(entry.role)}</span>
              {entry.organization && (
                <span style={S.entryOrg}>
                  {' '}
                  @ {renderInline(entry.organization)}
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
            <ItemBlock key={i} item={child} isKeyValueSection={false} S={S} />
          ))}
        </div>
      )}
    </div>
  );
}
