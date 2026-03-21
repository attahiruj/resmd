/**
 * Shared PDF primitive components for resume templates.
 *
 * These components:
 * - Guarantee PDF quality hints (wrap={false} on entries, minPresenceAhead on section titles)
 * - Accept template-specific style objects — zero visual coupling
 * - Delegate all visual customisation to the calling template via styles + render props
 *
 * Usage pattern in a template:
 *   <PdfSectionBlock
 *     section={section}
 *     styles={{ section: styles.section }}
 *     renderTitle={(title) => <Text style={styles.sectionTitle}>{title}</Text>}
 *     renderItem={(item, isKv) => <ItemBlock item={item} isKv={isKv} s={s} />}
 *   />
 */

import React from 'react';
import { View, Text, Link } from '@react-pdf/renderer';
import type {
  KeyValueItem,
  EntryItem,
  SectionItem,
  ResumeSection,
  RequiredResumeSettings,
} from '@/types/resume';
import { renderInlinePdf } from '@/lib/renderInlinePdf';
import { isUrl } from '@/lib/inline';

// react-pdf style objects are opaque — accept them as-is
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfStyle = any;

/** Renders a bullet list item with configurable bullet character and styles. */
export function PdfBulletRow({
  text,
  bullet = '–',
  styles,
  s,
}: {
  text: string;
  bullet?: string;
  styles: { row: PdfStyle; dash: PdfStyle; text: PdfStyle };
  s: RequiredResumeSettings;
}) {
  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.dash,
          { fontSize: s.fontSize, lineHeight: s.lineHeight },
        ]}
      >
        {bullet}
      </Text>
      <Text
        style={[
          styles.text,
          { fontSize: s.fontSize, lineHeight: s.lineHeight },
        ]}
      >
        {renderInlinePdf(text)}
      </Text>
    </View>
  );
}

/** Renders a plain text paragraph. */
export function PdfTextPara({
  text,
  style,
  s,
}: {
  text: string;
  style: PdfStyle;
  s: RequiredResumeSettings;
}) {
  return (
    <Text style={[style, { fontSize: s.fontSize }]}>
      {renderInlinePdf(text)}
    </Text>
  );
}

/**
 * Renders a key-value item.
 * - Non-skills path (isKeyValueSection=false): shared link-detection logic, *key prefix for URLs
 * - Skills path (isKeyValueSection=true): fully delegated to renderSkills
 */
export function PdfKvRow({
  item,
  isKeyValueSection,
  kvStyles,
  renderSkills,
  s,
}: {
  item: KeyValueItem;
  isKeyValueSection: boolean;
  kvStyles: { row: PdfStyle; key: PdfStyle; value: PdfStyle };
  renderSkills: (item: KeyValueItem) => React.ReactNode;
  s: RequiredResumeSettings;
}) {
  if (isKeyValueSection) return <>{renderSkills(item)}</>;
  return (
    <View style={kvStyles.row}>
      {isUrl(item.value) ? (
        <Link
          src={item.value}
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          <Text style={[kvStyles.key, { fontSize: s.fontSize - 1 }]}>
            *{item.key}
          </Text>
        </Link>
      ) : (
        <>
          <Text style={[kvStyles.key, { fontSize: s.fontSize - 1 }]}>
            {item.key}:
          </Text>
          <Text style={[kvStyles.value, { fontSize: s.fontSize }]}>
            {renderInlinePdf(item.value)}
          </Text>
        </>
      )}
    </View>
  );
}

/**
 * Renders an entry item (role @ org + meta + children).
 * Guarantees wrap={false} to prevent mid-entry page breaks.
 */
export function PdfEntryBlock({
  entry,
  styles,
  orgSeparator = ' · ',
  roleFontSizeDelta = 0,
  metaFontSizeDelta = -1,
  renderChildren,
  s,
}: {
  entry: EntryItem;
  styles: {
    entry: PdfStyle;
    entryHeader: PdfStyle;
    entryLeft: PdfStyle;
    entryRole: PdfStyle;
    entryOrg: PdfStyle;
    entryMeta: PdfStyle;
    entryChildren: PdfStyle;
  };
  /** Separator string between role and organisation, e.g. ' · ', ' – ', ' @ ', ', ' */
  orgSeparator?: string;
  /** Added to s.fontSize for role/org text. Use 0.5 for templates with slightly larger role text. */
  roleFontSizeDelta?: number;
  /** Added to s.fontSize for meta text. Typically -1 or -1.5. */
  metaFontSizeDelta?: number;
  renderChildren: (item: SectionItem) => React.ReactNode;
  s: RequiredResumeSettings;
}) {
  return (
    <View style={[styles.entry, { marginBottom: s.entrySpacing }]} wrap={false}>
      <View style={styles.entryHeader}>
        <View style={styles.entryLeft}>
          {entry.role ? (
            <Text>
              <Text
                style={[
                  styles.entryRole,
                  { fontSize: s.fontSize + roleFontSizeDelta },
                ]}
              >
                {renderInlinePdf(entry.role)}
              </Text>
              {entry.organization && (
                <Text
                  style={[
                    styles.entryOrg,
                    { fontSize: s.fontSize + roleFontSizeDelta },
                  ]}
                >
                  {orgSeparator}
                  {renderInlinePdf(entry.organization)}
                </Text>
              )}
            </Text>
          ) : (
            <Text
              style={[
                styles.entryRole,
                { fontSize: s.fontSize + roleFontSizeDelta },
              ]}
            >
              {renderInlinePdf(entry.heading)}
            </Text>
          )}
        </View>
        {entry.meta.length > 0 && (
          <Text
            style={[
              styles.entryMeta,
              { fontSize: s.fontSize + metaFontSizeDelta },
            ]}
          >
            {entry.meta.join(' · ')}
          </Text>
        )}
      </View>
      {entry.children.length > 0 && (
        <View style={styles.entryChildren}>
          {entry.children.map((child, i) => (
            <React.Fragment key={i}>{renderChildren(child)}</React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Renders a resume section with its items.
 * Guarantees minPresenceAhead={30} on the title so it stays with content across page breaks.
 * Accepts renderTitle for full visual customisation of the title chrome.
 */
export function PdfSectionBlock({
  section,
  styles,
  renderTitle,
  renderItem,
}: {
  section: ResumeSection;
  styles: { section: PdfStyle };
  renderTitle: (title: string) => React.ReactNode;
  renderItem: (
    item: SectionItem,
    isKeyValueSection: boolean
  ) => React.ReactNode;
}) {
  if (section.items.length === 0) return null;
  const isKv = section.hint === 'keyvalue';
  return (
    <View style={styles.section}>
      <View minPresenceAhead={30}>{renderTitle(section.title)}</View>
      {section.items.map((item, i) => (
        <React.Fragment key={i}>{renderItem(item, isKv)}</React.Fragment>
      ))}
    </View>
  );
}
