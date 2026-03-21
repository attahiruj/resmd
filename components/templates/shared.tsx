/**
 * Shared web primitive components for resume templates.
 *
 * These components:
 * - Guarantee structural attributes (data-block="avoid" on entries, data-section on sections)
 * - Accept template-specific inline style objects — zero visual coupling
 * - Delegate all visual customisation to the calling template via styles + render props
 *
 * Note: Web templates pre-compute all font sizes into their style objects (the `S` const),
 * so these components receive fully-resolved styles and do not need settings (`s`) at all.
 *
 * Usage pattern in a template:
 *   <WebSectionBlock
 *     section={section}
 *     styles={{ section: S.section }}
 *     renderTitle={(title) => <h2 style={S.sectionTitle}>{title}</h2>}
 *     renderItem={(item, isKv) => <ItemBlock item={item} isKv={isKv} S={S} />}
 *   />
 */

import React from 'react';
import type {
  ResumeSection,
  SectionItem,
  KeyValueItem,
  EntryItem,
} from '@/types/resume';
import { renderInline } from '@/lib/renderInline';
import { isUrl } from '@/lib/inline';

// Inline style objects are opaque from the shared component perspective
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WS = any;

/** Renders a bullet list item with configurable bullet character and styles. */
export function WebBulletRow({
  text,
  bullet,
  styles,
}: {
  text: string;
  bullet: string;
  styles: { row: WS; dash: WS; text: WS };
}) {
  return (
    <div style={styles.row}>
      <span style={styles.dash}>{bullet}</span>
      <span style={styles.text}>{renderInline(text)}</span>
    </div>
  );
}

/**
 * Renders a key-value item.
 * - Non-skills path (isKeyValueSection=false): shared link-detection logic, *key prefix for URLs
 * - Skills path (isKeyValueSection=true): fully delegated to renderSkills
 */
export function WebKvRow({
  item,
  isKeyValueSection,
  kvStyles,
  renderSkills,
}: {
  item: KeyValueItem;
  isKeyValueSection: boolean;
  kvStyles: { row: WS; key: WS; value: WS };
  renderSkills: (item: KeyValueItem) => React.ReactNode;
}) {
  if (isKeyValueSection) return <>{renderSkills(item)}</>;
  return (
    <div style={kvStyles.row}>
      {isUrl(item.value) ? (
        <a
          href={item.value}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          <span style={kvStyles.key}>*{item.key}</span>
        </a>
      ) : (
        <>
          <span style={kvStyles.key}>{item.key}:</span>
          <span style={kvStyles.value}>{renderInline(item.value)}</span>
        </>
      )}
    </div>
  );
}

/**
 * Renders an entry item (role + org + meta + children).
 * Guarantees data-block="avoid" to signal the print pagination pipeline.
 */
export function WebEntryBlock({
  entry,
  styles,
  orgSeparator = ' · ',
  renderChildren,
}: {
  entry: EntryItem;
  styles: {
    entry: WS;
    entryHeader: WS;
    entryRole: WS;
    entryOrg: WS;
    entryMeta: WS;
    entryChildren: WS;
  };
  /** Separator string between role and organisation, e.g. ' · ', ' – ', ' @ ', ', ' */
  orgSeparator?: string;
  renderChildren: (item: SectionItem) => React.ReactNode;
}) {
  return (
    <div data-block="avoid" style={styles.entry}>
      <div style={styles.entryHeader}>
        <div style={{ flex: 1 }}>
          {entry.role ? (
            <span>
              <span style={styles.entryRole}>{renderInline(entry.role)}</span>
              {entry.organization && (
                <span style={styles.entryOrg}>
                  {orgSeparator}
                  {renderInline(entry.organization)}
                </span>
              )}
            </span>
          ) : (
            <span style={styles.entryRole}>{renderInline(entry.heading)}</span>
          )}
        </div>
        {entry.meta.length > 0 && (
          <span style={styles.entryMeta}>{entry.meta.join(' · ')}</span>
        )}
      </div>
      {entry.children.length > 0 && (
        <div style={styles.entryChildren}>
          {entry.children.map((child, i) => (
            <React.Fragment key={i}>{renderChildren(child)}</React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders a resume section with its items.
 * Wraps content in <section data-section={id}> for the pagination pipeline.
 * Accepts renderTitle for full visual customisation of the title chrome.
 */
export function WebSectionBlock({
  section,
  styles,
  renderTitle,
  renderItem,
}: {
  section: ResumeSection;
  styles: { section: WS };
  renderTitle: (title: string) => React.ReactNode;
  renderItem: (
    item: SectionItem,
    isKeyValueSection: boolean
  ) => React.ReactNode;
}) {
  if (section.items.length === 0) return null;
  const isKv = section.hint === 'keyvalue';
  return (
    <section data-section={section.id} style={styles.section}>
      {renderTitle(section.title)}
      {section.items.map((item, i) => (
        <React.Fragment key={i}>{renderItem(item, isKv)}</React.Fragment>
      ))}
    </section>
  );
}
