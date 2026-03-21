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

const TEAL = '#0E7C7B';
const TEAL_LIGHT = '#E0F4F4';
const TEAL_MID = '#3BAAA9';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CreativeStyles = Record<string, any>;

export default function Creative({ resume, showHeader = true }: TemplateProps) {
  const { sections, meta } = resume;
  const s = { ...DEFAULT_SETTINGS, ...resume.settings };

  const S: CreativeStyles = {
    page: {
      fontFamily: FONT,
      fontSize: s.fontSize,
      color: '#222222',
      background: '#FFFFFF',
      lineHeight: s.lineHeight,
      paddingTop: s.marginV,
      paddingBottom: s.marginV,
      paddingLeft: s.marginH,
      paddingRight: s.marginH,
    },
    header: {
      marginBottom: 22,
      borderLeft: `4px solid ${TEAL}`,
      paddingLeft: 12,
    },
    name: {
      fontSize: 30,
      fontWeight: 700,
      color: TEAL,
      margin: 0,
      marginBottom: 3,
      lineHeight: 1.1,
    },
    jobTitle: {
      fontSize: 11.5,
      color: '#555555',
      margin: 0,
      marginBottom: 8,
    },
    contactRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
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
      fontSize: s.fontSize,
      color: '#555555',
      lineHeight: 1.6,
    },
    section: { marginBottom: 16 },
    sectionTitleWrap: { marginBottom: 8 },
    sectionTitle: {
      display: 'inline-block' as const,
      fontSize: 7.5,
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      color: '#FFFFFF',
      backgroundColor: TEAL,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 3,
      paddingBottom: 3,
      borderRadius: 3,
    },
    entry: { marginBottom: s.entrySpacing },
    entryHeader: {
      display: 'flex',
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    entryRole: { fontSize: s.fontSize, fontWeight: 700, color: '#1A1A1A' },
    entryOrg: { fontSize: s.fontSize, color: TEAL_MID },
    entryMeta: {
      fontSize: s.fontSize - 1,
      color: '#888888',
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
      marginLeft: 8,
    },
    entryChildren: { marginTop: 4 },
    bulletRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      marginBottom: 3,
    },
    bulletDash: {
      fontSize: s.fontSize,
      color: TEAL,
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
    kvSkillsRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'flex-start',
      marginBottom: 5,
      gap: 6,
    },
    kvSkillsLabel: {
      fontSize: s.fontSize,
      color: '#666666',
      flexShrink: 0,
      minWidth: 60,
    },
    tagsRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 4,
    },
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
              {contactEntries.map((entry) =>
                entry.href ? (
                  <a
                    key={entry.key}
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <span style={S.contactChip}>{entry.key}</span>
                  </a>
                ) : (
                  <span key={entry.key} style={S.contactChip}>
                    {entry.rawValue}
                  </span>
                )
              )}
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
        <CreativeSectionBlock key={section.id} section={section} S={S} />
      ))}
    </article>
  );
}

function CreativeSectionBlock({
  section,
  S,
}: {
  section: ResumeSection;
  S: CreativeStyles;
}) {
  if (section.items.length === 0) return null;
  return (
    <section data-section={section.id} style={S.section}>
      <div style={S.sectionTitleWrap}>
        <span style={S.sectionTitle}>{section.title}</span>
      </div>
      {section.items.map((item, i) => (
        <CreativeItemBlock
          key={i}
          item={item}
          isKeyValueSection={section.hint === 'keyvalue'}
          S={S}
        />
      ))}
    </section>
  );
}

function CreativeItemBlock({
  item,
  isKeyValueSection,
  S,
}: {
  item: SectionItem;
  isKeyValueSection: boolean;
  S: CreativeStyles;
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
            <div style={S.tagsRow}>
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
              <span style={S.kvKey}>{item.key}</span>
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
      return <CreativeEntryBlock entry={item} S={S} />;
    case 'bullet':
      return (
        <div style={S.bulletRow}>
          <span style={S.bulletDash}>◆</span>
          <span style={S.bulletText}>{renderInline(item.text)}</span>
        </div>
      );
    case 'text':
      return <p style={S.textPara}>{renderInline(item.text)}</p>;
  }
}

function CreativeEntryBlock({
  entry,
  S,
}: {
  entry: EntryItem;
  S: CreativeStyles;
}) {
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
                  · {renderInline(entry.organization)}
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
            <CreativeItemBlock
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
