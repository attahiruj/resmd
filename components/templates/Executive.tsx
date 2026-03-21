'use client';

import React from 'react';
import type {
  TemplateProps,
  ResumeSection,
  SectionItem,
  EntryItem,
} from '@/types/resume';
import { DEFAULT_SETTINGS } from '@/types/resume';
import { renderInline } from '@/lib/renderInline';
import { isUrl, extractLink } from '@/lib/inline';

const FONT = "var(--font-noto-sans), 'Noto Sans', sans-serif";
const HEADER_META_KEYS = new Set(['name', 'title', 'role', 'position']);
const HEADER_ABOUT_KEYS = new Set(['about', 'summary', 'objective', 'profile']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExecStyles = Record<string, any>;

export default function Executive({
  resume,
  showHeader = true,
}: TemplateProps) {
  const { sections, meta } = resume;
  const s = { ...DEFAULT_SETTINGS, ...resume.settings };

  const S: ExecStyles = {
    page: {
      fontFamily: FONT,
      fontSize: s.fontSize,
      color: '#1C1C1C',
      background: '#FFFFFF',
      lineHeight: s.lineHeight,
    },
    headerBox: {
      backgroundColor: '#1B2438',
      paddingTop: s.marginV,
      paddingBottom: s.marginV * 0.85,
      paddingLeft: s.marginH,
      paddingRight: s.marginH,
    },
    name: {
      fontSize: 28,
      fontWeight: 700,
      color: '#FFFFFF',
      margin: 0,
      marginBottom: 4,
      lineHeight: 1.1,
    },
    jobTitle: {
      fontSize: 11,
      color: '#A8B4CC',
      margin: 0,
      marginBottom: 14,
      letterSpacing: '0.3px',
    },
    goldLine: {
      height: 1,
      backgroundColor: '#B8973C',
      marginBottom: 10,
    },
    contactRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 4,
      alignItems: 'center',
    },
    contactItem: {
      fontSize: 8.5,
      color: '#9AAABF',
    },
    contactSep: {
      fontSize: 8.5,
      color: '#B8973C',
      marginLeft: 5,
      marginRight: 5,
    },
    headerAbout: {
      fontSize: s.fontSize,
      color: '#A8B4CC',
      lineHeight: 1.6,
    },
    body: {
      paddingTop: s.marginV * 0.85,
      paddingBottom: s.marginV,
      paddingLeft: s.marginH,
      paddingRight: s.marginH,
    },
    section: { marginBottom: 16 },
    sectionTitleRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'center',
      gap: 8,
      marginBottom: 3,
    },
    sectionAccent: {
      width: 3,
      height: 12,
      backgroundColor: '#B8973C',
      flexShrink: 0,
    },
    sectionTitle: {
      fontSize: 7.5,
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      color: '#1B2438',
    },
    sectionDivider: {
      height: 1,
      backgroundColor: '#E8E4D8',
      marginBottom: 8,
    },
    entry: { marginBottom: s.entrySpacing },
    entryHeader: {
      display: 'flex',
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    entryRole: { fontSize: s.fontSize, fontWeight: 700, color: '#1B2438' },
    entryOrg: {
      fontSize: s.fontSize,
      color: '#5A6070',
      fontStyle: 'italic' as const,
    },
    entryMeta: {
      fontSize: s.fontSize - 1,
      color: '#8890A8',
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
      marginLeft: 8,
    },
    entryChildren: { marginTop: 4 },
    bulletRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      marginBottom: 2.5,
    },
    bulletDash: {
      fontSize: s.fontSize,
      color: '#B8973C',
      marginRight: 6,
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
      width: 64,
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
      fontSize: s.fontSize,
      fontWeight: 600,
      color: '#5A6070',
      marginRight: 8,
      flexShrink: 0,
    },
    kvSkillsValue: {
      fontSize: s.fontSize,
      color: '#333333',
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

  return (
    <article style={S.page}>
      {showHeader && (
        <div data-header style={S.headerBox}>
          {meta.name && <h1 style={S.name}>{meta.name}</h1>}
          {meta.title && <p style={S.jobTitle}>{meta.title}</p>}
          {contactEntries.length > 0 && (
            <>
              <div style={S.goldLine} />
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
                        <span style={S.contactItem}>{entry.key}</span>
                      </a>
                    ) : (
                      <span style={S.contactItem}>{entry.rawValue}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
          {aboutLines.map((line, i) => (
            <p key={i} style={{ ...S.headerAbout, margin: 0, marginTop: 12 }}>
              {line}
            </p>
          ))}
        </div>
      )}

      <div style={S.body}>
        {bodySections.map((section) => (
          <ExecSectionBlock key={section.id} section={section} S={S} />
        ))}
      </div>
    </article>
  );
}

function ExecSectionBlock({
  section,
  S,
}: {
  section: ResumeSection;
  S: ExecStyles;
}) {
  if (section.items.length === 0) return null;
  return (
    <section data-section={section.id} style={S.section}>
      <div style={S.sectionTitleRow}>
        <div style={S.sectionAccent} />
        <h2 style={S.sectionTitle}>{section.title}</h2>
      </div>
      <div style={S.sectionDivider} />
      {section.items.map((item, i) => (
        <ExecItemBlock
          key={i}
          item={item}
          isKeyValueSection={section.hint === 'keyvalue'}
          S={S}
        />
      ))}
    </section>
  );
}

function ExecItemBlock({
  item,
  isKeyValueSection,
  S,
}: {
  item: SectionItem;
  isKeyValueSection: boolean;
  S: ExecStyles;
}) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        return (
          <div style={S.kvSkillsRow}>
            <span style={S.kvSkillsLabel}>{item.key}:</span>
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
      return <ExecEntryBlock entry={item} S={S} />;
    case 'bullet':
      return (
        <div style={S.bulletRow}>
          <span style={S.bulletDash}>▸</span>
          <span style={S.bulletText}>{renderInline(item.text)}</span>
        </div>
      );
    case 'text':
      return <p style={S.textPara}>{renderInline(item.text)}</p>;
  }
}

function ExecEntryBlock({ entry, S }: { entry: EntryItem; S: ExecStyles }) {
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
                  – {renderInline(entry.organization)}
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
            <ExecItemBlock
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
