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

  const { contactEntries, aboutLines, bodySections } = parseResumeHeader(
    sections,
    showHeader
  );

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
          <WebSectionBlock
            key={section.id}
            section={section}
            styles={{ section: S.section }}
            renderTitle={(title) => (
              <>
                <div style={S.sectionTitleRow}>
                  <div style={S.sectionAccent} />
                  <h2 style={S.sectionTitle}>{title}</h2>
                </div>
                <div style={S.sectionDivider} />
              </>
            )}
            renderItem={(item, isKv) => (
              <ItemBlock item={item} isKv={isKv} S={S} />
            )}
          />
        ))}
      </div>
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
  S: ExecStyles;
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
          orgSeparator=" – "
          renderChildren={(child) => (
            <ItemBlock item={child} isKv={false} S={S} />
          )}
        />
      );
    case 'bullet':
      return (
        <WebBulletRow
          text={item.text}
          bullet="•"
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
