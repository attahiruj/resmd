import type { ResumeSection } from '@/types/resume';
import { isUrl, extractLink } from '@/lib/inline';

export const HEADER_META_KEYS: ReadonlySet<string> = new Set([
  'name',
  'title',
  'role',
  'position',
]);

export const HEADER_ABOUT_KEYS: ReadonlySet<string> = new Set([
  'about',
  'summary',
  'objective',
  'profile',
]);

export interface ContactEntry {
  key: string;
  href: string | null; // null = plain text, not a link
  rawValue: string;
}

export interface ParsedResumeHeader {
  headerSection: ResumeSection | null;
  contactEntries: ContactEntry[];
  aboutLines: string[];
  bodySections: ResumeSection[];
}

/**
 * Extracts header data from resume sections.
 * When showHeader is false, returns empty header and all sections as body
 * (for multi-page continuation pages).
 */
export function parseResumeHeader(
  sections: ResumeSection[],
  showHeader = true
): ParsedResumeHeader {
  if (!showHeader) {
    return {
      headerSection: null,
      contactEntries: [],
      aboutLines: [],
      bodySections: sections,
    };
  }

  const headerSection =
    sections.find(
      (sec) => sec.hint === 'keyvalue' || sec.title.toLowerCase() === 'bio'
    ) ??
    sections[0] ??
    null;

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
      if (link) {
        contactEntries.push({
          key: link.text,
          href: link.href,
          rawValue: link.href,
        });
      }
    }
  }

  const bodySections = sections.filter((sec) => sec !== headerSection);
  return { headerSection, contactEntries, aboutLines, bodySections };
}

/**
 * Sorts contact entries so that priority keys (github, website, etc.)
 * appear first. Used by the Technical template.
 */
export function sortContactsByPriority(
  entries: ContactEntry[],
  priorityKeys: string[] = ['github', 'website', 'portfolio', 'linkedin']
): ContactEntry[] {
  return [
    ...entries.filter((e) => priorityKeys.includes(e.key.toLowerCase())),
    ...entries.filter((e) => !priorityKeys.includes(e.key.toLowerCase())),
  ];
}

/**
 * Splits a comma-separated skill/tag value into an array of trimmed strings.
 * Used by Modern, Creative, and Technical templates.
 */
export function splitTagValue(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}
