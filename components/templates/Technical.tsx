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

const FONT = "'Courier New', Courier, monospace";
const HEADER_META_KEYS = new Set(['name', 'title', 'role', 'position']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TechStyles = Record<string, any>;

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

export default function Technical({
  resume,
  isPro,
  showHeader = true,
}: TemplateProps) {
  const { sections, meta } = resume;
  const s = { ...DEFAULT_SETTINGS, ...resume.settings };

  // Styles mirror pdf/Technical.tsx 1:1 (pt → px). Dynamic values come from settings.
  const S: TechStyles = {
    page: {
      fontFamily: FONT,
      fontSize: s.fontSize,
      color: '#1A1C23',
      paddingTop: s.marginV,
      paddingBottom: s.marginV,
      paddingLeft: s.marginH,
      paddingRight: s.marginH,
      lineHeight: s.lineHeight,
      background: '#ffffff',
    },
    header: { marginBottom: 16 },
    name: {
      fontSize: 22,
      fontWeight: 700,
      color: '#0A0C10',
      margin: 0,
      marginBottom: 2,
      lineHeight: 1.1,
    },
    jobTitle: { fontSize: s.fontSize + 0.5, color: '#555870', margin: 0, marginBottom: 6 },
    contactRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 6,
    },
    contactChip: {
      fontSize: s.fontSize - 1,
      color: '#445577',
      backgroundColor: '#EEF0F8',
      paddingLeft: 6,
      paddingRight: 6,
      paddingTop: 2,
      paddingBottom: 2,
      borderRadius: 3,
    },
    divider: {
      borderBottom: '1px solid #D0D4E8',
      marginTop: 10,
      marginBottom: 10,
    },
    section: { marginBottom: 12 },
    sectionTitle: {
      fontSize: 8,
      fontWeight: 700,
      color: '#445577',
      marginBottom: 6,
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
    },
    skillsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
    },
    skillGroupLabel: {
      fontSize: 7.5,
      fontWeight: 700,
      color: '#778899',
      marginBottom: 3,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    skillTagsRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 3,
    },
    skillTag: {
      fontSize: s.fontSize - 1.5,
      color: '#334466',
      backgroundColor: '#F0F2F8',
      border: '1px solid #D8DCF0',
      paddingLeft: 5,
      paddingRight: 5,
      paddingTop: 1.5,
      paddingBottom: 1.5,
      borderRadius: 3,
    },
    entry: { marginBottom: s.entrySpacing },
    entryHeader: {
      display: 'flex',
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    entryRole: { fontSize: s.fontSize, fontWeight: 700, color: '#0A0C10' },
    entryOrg: { fontSize: s.fontSize, fontWeight: 400, color: '#445577' },
    entryMetaBadge: {
      fontSize: s.fontSize - 1.5,
      color: '#667799',
      backgroundColor: '#EEF0F8',
      paddingLeft: 5,
      paddingRight: 5,
      paddingTop: 2,
      paddingBottom: 2,
      borderRadius: 3,
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
      marginLeft: 8,
    },
    entryChildren: {
      paddingLeft: 8,
      marginTop: 3,
      borderLeft: '1px solid #DDE0F0',
    },
    projectCard: {
      marginBottom: s.entrySpacing,
      border: '1px solid #D8DCF0',
      borderRadius: 4,
      padding: 8,
    },
    projectHeader: {
      display: 'flex',
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 3,
    },
    projectName: { fontSize: s.fontSize, fontWeight: 700, color: '#1A1C23' },
    projectUrl: {
      fontSize: s.fontSize - 1.5,
      color: '#778899',
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
      marginLeft: 8,
    },
    bulletRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      marginBottom: 2.5,
    },
    bulletDash: {
      fontSize: s.fontSize,
      color: '#8899BB',
      marginRight: 5,
      flexShrink: 0,
    },
    bulletText: { fontSize: s.fontSize, color: '#2A2C35', flex: 1 },
    textPara: {
      fontSize: s.fontSize,
      color: '#445566',
      marginBottom: 3,
      lineHeight: 1.6,
    },
    kvRow: { display: 'flex', flexDirection: 'row' as const, marginBottom: 3 },
    kvKey: {
      fontSize: s.fontSize - 1,
      color: '#778899',
      fontWeight: 700,
      width: 62,
      flexShrink: 0,
    },
    kvValue: { fontSize: s.fontSize, color: '#333344', flex: 1 },
    footer: {
      marginTop: 16,
      borderTop: '1px solid #D8DCF0',
      paddingTop: 5,
      textAlign: 'center' as const,
    },
    footerText: { fontSize: 7.5, color: '#AABBCC' },
  };

  const headerSection = showHeader
    ? (sections.find(
        (sec) => sec.hint === 'keyvalue' || sec.title.toLowerCase() === 'bio'
      ) ??
      sections[0] ??
      null)
    : null;

  type ContactEntry = { key: string; href: string | null; rawValue: string };
  const contactEntries: ContactEntry[] = (headerSection?.items ?? []).flatMap(
    (item) => {
      if (
        item.kind === 'keyvalue' &&
        !HEADER_META_KEYS.has(item.key.toLowerCase())
      ) {
        return [
          {
            key: item.key,
            href: isUrl(item.value) ? item.value : null,
            rawValue: item.value,
          },
        ];
      }
      if (item.kind === 'text') {
        const link = extractLink(item.text);
        if (link)
          return [{ key: link.text, href: link.href, rawValue: link.href }];
      }
      return [];
    }
  );

  // Prioritize GitHub/website/portfolio at the front
  const priorityKeys = ['github', 'website', 'portfolio', 'linkedin'];
  const sortedContact = [
    ...contactEntries.filter((e) => priorityKeys.includes(e.key.toLowerCase())),
    ...contactEntries.filter(
      (e) => !priorityKeys.includes(e.key.toLowerCase())
    ),
  ];

  const bodySections = sections.filter((sec) => sec !== headerSection);

  return (
    <article style={S.page}>
      {showHeader && (
        <header data-header style={S.header}>
          {meta.name && <h1 style={S.name}>{meta.name}</h1>}
          {meta.title && <p style={S.jobTitle}>{meta.title}</p>}
          {sortedContact.length > 0 && (
            <div style={S.contactRow}>
              {sortedContact.map((entry) => (
                <span key={entry.key} style={S.contactChip}>
                  {entry.href ? (
                    <a
                      href={entry.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      ↗ {entry.key}
                    </a>
                  ) : (
                    <>
                      {entry.key}: {entry.rawValue}
                    </>
                  )}
                </span>
              ))}
            </div>
          )}
        </header>
      )}

      {showHeader && <div style={S.divider} />}

      {bodySections.map((section) => (
        <TechSectionBlock key={section.id} section={section} S={S} />
      ))}

      {!isPro && (
        <footer style={S.footer}>
          <span style={S.footerText}>Created with resmd · resmd.app</span>
        </footer>
      )}
    </article>
  );
}

function TechSectionBlock({
  section,
  S,
}: {
  section: ResumeSection;
  S: TechStyles;
}) {
  if (section.items.length === 0) return null;

  if (isSkillsSection(section)) {
    const kvItems = section.items.filter(
      (i): i is KeyValueItem => i.kind === 'keyvalue'
    );
    if (kvItems.length > 0) {
      return (
        <section data-section={section.id} style={S.section}>
          <h2 style={S.sectionTitle}>{'// ' + section.title}</h2>
          <div style={S.skillsGrid}>
            {kvItems.map((item) => {
              const tags = item.value
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean);
              return (
                <div key={item.key}>
                  <p style={S.skillGroupLabel}>{item.key}</p>
                  <div style={S.skillTagsRow}>
                    {tags.map((tag) => (
                      <span key={tag} style={S.skillTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );
    }
  }

  if (isProjectsSection(section)) {
    const entryItems = section.items.filter(
      (i): i is EntryItem => i.kind === 'entry'
    );
    if (entryItems.length > 0) {
      return (
        <section data-section={section.id} style={S.section}>
          <h2 style={S.sectionTitle}>{'// ' + section.title}</h2>
          {entryItems.map((entry, i) => (
            <div key={i} data-block="avoid" style={S.projectCard}>
              <div style={S.projectHeader}>
                <span style={S.projectName}>
                  {entry.heading.split('|')[0].trim()}
                </span>
                {entry.meta.length > 0 && (
                  <span style={S.projectUrl}>{entry.meta[0]}</span>
                )}
              </div>
              {entry.children.map((child, j) => (
                <TechItemBlock
                  key={j}
                  item={child}
                  isKeyValueSection={false}
                  S={S}
                />
              ))}
            </div>
          ))}
        </section>
      );
    }
  }

  return (
    <section data-section={section.id} style={S.section}>
      <h2 style={S.sectionTitle}>{'// ' + section.title}</h2>
      {section.items.map((item, i) => (
        <TechItemBlock
          key={i}
          item={item}
          isKeyValueSection={section.hint === 'keyvalue'}
          S={S}
        />
      ))}
    </section>
  );
}

function TechItemBlock({
  item,
  isKeyValueSection,
  S,
}: {
  item: SectionItem;
  isKeyValueSection: boolean;
  S: TechStyles;
}) {
  switch (item.kind) {
    case 'keyvalue': {
      if (isKeyValueSection) {
        const tags = item.value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
        return (
          <div
            style={{ display: 'flex', flexDirection: 'row', marginBottom: 4 }}
          >
            <span style={S.kvKey}>{item.key}:</span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                flex: 1,
                gap: 3,
              }}
            >
              {tags.map((tag) => (
                <span key={tag} style={S.skillTag}>
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
      return <TechEntryBlock entry={item} S={S} />;
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

function TechEntryBlock({ entry, S }: { entry: EntryItem; S: TechStyles }) {
  return (
    <div data-block="avoid" style={S.entry}>
      <div style={S.entryHeader}>
        <div style={{ flex: 1 }}>
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
          <span style={S.entryMetaBadge}>{entry.meta.join(' · ')}</span>
        )}
      </div>
      {entry.children.length > 0 && (
        <div style={S.entryChildren}>
          {entry.children.map((child, i) => (
            <TechItemBlock
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
