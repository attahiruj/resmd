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
import {
  parseResumeHeader,
  sortContactsByPriority,
  splitTagValue,
} from '@/lib/templateUtils';
import {
  WebSectionBlock,
  WebEntryBlock,
  WebBulletRow,
  WebKvRow,
} from '@/components/templates/shared';

const FONT =
  "var(--font-courier-prime), 'Courier Prime', 'Courier New', monospace";

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
    jobTitle: {
      fontSize: s.fontSize + 0.5,
      color: '#555870',
      margin: 0,
      marginBottom: 6,
    },
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
    headerAbout: {
      fontSize: s.fontSize,
      color: '#445566',
      lineHeight: 1.6,
      marginTop: 8,
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
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
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
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
      marginLeft: 8,
    },
    entryChildren: {
      marginTop: 3,
    },
    projectCard: {
      marginBottom: s.entrySpacing,
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
    kvSkillsKey: {
      fontSize: s.fontSize,
      color: '#778899',
      fontWeight: 700,
      marginRight: 6,
      flexShrink: 0,
    },
    kvValue: { fontSize: s.fontSize, color: '#333344', flex: 1 },
  };

  const { contactEntries, aboutLines, bodySections } = parseResumeHeader(
    sections,
    showHeader
  );
  const sortedContact = sortContactsByPriority(contactEntries);

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
                      *{entry.key}
                    </a>
                  ) : (
                    <>{entry.rawValue}</>
                  )}
                </span>
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

      {showHeader && <div style={S.divider} />}

      {bodySections.map((section) => (
        <TechSectionBlock key={section.id} section={section} S={S} />
      ))}
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
  if (isSkillsSection(section)) {
    const kvItems = section.items.filter(
      (i): i is KeyValueItem => i.kind === 'keyvalue'
    );
    if (kvItems.length > 0) {
      return (
        <section data-section={section.id} style={S.section}>
          <h2 style={S.sectionTitle}>{'// ' + section.title}</h2>
          <div style={S.skillsGrid}>
            {kvItems.map((item) => (
              <div key={item.key} style={S.kvRow}>
                <span style={S.kvSkillsKey}>{item.key}:</span>
                <span style={S.kvValue}>
                  {splitTagValue(item.value).join(', ')}
                </span>
              </div>
            ))}
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
    <WebSectionBlock
      section={section}
      styles={{ section: S.section }}
      renderTitle={(title) => <h2 style={S.sectionTitle}>{'// ' + title}</h2>}
      renderItem={(item, isKv) => (
        <TechItemBlock item={item} isKeyValueSection={isKv} S={S} />
      )}
    />
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
    case 'keyvalue':
      return (
        <WebKvRow
          item={item}
          isKeyValueSection={isKeyValueSection}
          kvStyles={{ row: S.kvRow, key: S.kvKey, value: S.kvValue }}
          renderSkills={(kv: KeyValueItem) => (
            <div style={S.kvRow}>
              <span style={S.kvSkillsKey}>{kv.key}:</span>
              <span style={S.kvValue}>
                {splitTagValue(kv.value).join(', ')}
              </span>
            </div>
          )}
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
            entryMeta: S.entryMetaBadge,
            entryChildren: S.entryChildren,
          }}
          orgSeparator=" @ "
          renderChildren={(child) => (
            <TechItemBlock item={child} isKeyValueSection={false} S={S} />
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
