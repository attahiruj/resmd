'use client';

import React from 'react';
import type { TemplateProps, SectionItem, KeyValueItem } from '@/types/resume';
import { DEFAULT_SETTINGS } from '@/types/resume';
import { renderInline } from '@/lib/renderInline';
import { parseResumeHeader } from '@/lib/templateUtils';
import {
  WebSectionBlock,
  WebEntryBlock,
  WebBulletRow,
  WebKvRow,
} from '@/components/templates/shared';

const FONT = "var(--font-noto-sans), 'Noto Sans', sans-serif";

export default function Minimal({ resume, showHeader = true }: TemplateProps) {
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
    entryChildren: { marginTop: 3 },
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
      fontSize: s.fontSize,
      color: '#888888',
      marginRight: 6,
      flexShrink: 0,
    },
    kvSkillsValue: {
      fontSize: s.fontSize,
      color: '#333333',
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

  const { contactEntries, aboutLines, bodySections } = parseResumeHeader(
    sections,
    showHeader
  );

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
                      <span style={S.contactItem}>*{entry.key}</span>
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
        <WebSectionBlock
          key={section.id}
          section={section}
          styles={{ section: S.section }}
          renderTitle={(title) => <h2 style={S.sectionTitle}>{title}</h2>}
          renderItem={(item, isKv) => (
            <ItemBlock item={item} isKv={isKv} S={S} />
          )}
        />
      ))}
    </article>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MinimalStyles = Record<string, any>;

function ItemBlock({
  item,
  isKv,
  S,
}: {
  item: SectionItem;
  isKv: boolean;
  S: MinimalStyles;
}) {
  switch (item.kind) {
    case 'keyvalue':
      return (
        <WebKvRow
          item={item}
          isKeyValueSection={isKv}
          kvStyles={{ row: S.kvRow, key: S.kvKey, value: S.kvValue }}
          renderSkills={(kv: KeyValueItem) => (
            <div style={S.kvSkillsRow}>
              <span style={S.kvSkillsLabel}>{kv.key}:</span>
              <span style={S.kvSkillsValue}>{kv.value}</span>
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
            entryMeta: S.entryMeta,
            entryChildren: S.entryChildren,
          }}
          orgSeparator=" · "
          renderChildren={(child) => (
            <ItemBlock item={child} isKv={false} S={S} />
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
