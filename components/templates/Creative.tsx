'use client';

import React from 'react';
import type { TemplateProps, SectionItem, KeyValueItem } from '@/types/resume';
import { DEFAULT_SETTINGS } from '@/types/resume';
import { renderInline } from '@/lib/renderInline';
import { parseResumeHeader, splitTagValue } from '@/lib/templateUtils';
import {
  WebSectionBlock,
  WebEntryBlock,
  WebBulletRow,
  WebKvRow,
} from '@/components/templates/shared';

const FONT = "var(--font-noto-sans), 'Noto Sans', sans-serif";

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
        <WebSectionBlock
          key={section.id}
          section={section}
          styles={{ section: S.section }}
          renderTitle={(title) => (
            <div style={S.sectionTitleWrap}>
              <span style={S.sectionTitle}>{title}</span>
            </div>
          )}
          renderItem={(item, isKv) => (
            <ItemBlock item={item} isKv={isKv} S={S} />
          )}
        />
      ))}
    </article>
  );
}

function ItemBlock({
  item,
  isKv,
  S,
}: {
  item: SectionItem;
  isKv: boolean;
  S: CreativeStyles;
}) {
  switch (item.kind) {
    case 'keyvalue':
      return (
        <WebKvRow
          item={item}
          isKeyValueSection={isKv}
          kvStyles={{ row: S.kvRow, key: S.kvKey, value: S.kvValue }}
          renderSkills={(kv: KeyValueItem) => {
            const tags = splitTagValue(kv.value);
            return (
              <div style={S.kvSkillsRow}>
                <span style={S.kvSkillsLabel}>{kv.key}:</span>
                <div style={S.tagsRow}>
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
          bullet="◆"
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
