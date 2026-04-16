import type { MappingResult } from './types';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX =
  /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/;
const URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/;
const YEAR_PATTERN = /\b(19|20)\d{2}\b/;
const DATE_RANGE_PATTERN =
  /\b(19|20)\d{2}\s*[-–]\s*(?:(19|20)\d{2}|present|current)\b/i;

const SECTION_KEYWORDS = [
  'experience',
  'employment',
  'work',
  'education',
  'skills',
  'projects',
  'summary',
  'objective',
  'about',
  'contact',
  'bio',
  'certifications',
  'certificates',
  'languages',
  'awards',
  'honors',
  'volunteer',
  'publications',
  'references',
];

const ALL_CAPS_MIN_LENGTH = 3;

function isAllCaps(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  return letters.length >= ALL_CAPS_MIN_LENGTH && text === text.toUpperCase();
}

function isSectionHeading(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return SECTION_KEYWORDS.some((keyword) => {
    if (lower === keyword) return true;
    if (lower.startsWith(keyword + ':') || lower.startsWith(keyword + 's:'))
      return true;
    return false;
  });
}

function detectYearInLine(line: string): string | null {
  const rangeMatch = line.match(DATE_RANGE_PATTERN);
  if (rangeMatch) return rangeMatch[0];
  const yearMatch = line.match(YEAR_PATTERN);
  return yearMatch ? yearMatch[0] : null;
}

export function mapToResMarkup(text: string): MappingResult {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  const result: string[] = [];
  const detectedFields: MappingResult['detectedFields'] = {};

  const bioFields: Map<string, string> = new Map();
  let inBioSection = false;
  let inSection = false;
  let currentSectionTitle = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineLower = line.toLowerCase();

    if (
      i === 0 &&
      (isAllCaps(line) || isSectionHeading(line) || line.includes(':'))
    ) {
      inBioSection = true;
      currentSectionTitle = 'Bio';
      result.push('# Bio');
    }

    if (isAllCaps(line) && line.length > 3 && line.length < 50) {
      if (inSection && result.length > 0) {
      }
      inSection = true;
      inBioSection = false;
      currentSectionTitle =
        line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
      result.push(`# ${currentSectionTitle}`);
      continue;
    }

    if (line.startsWith('## ')) {
      result.push(line);
      inSection = true;
      inBioSection = false;
      continue;
    }

    if (isSectionHeading(line)) {
      const title = line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
      result.push(`# ${title}`);
      inSection = true;
      inBioSection = title.toLowerCase() === 'bio';
      currentSectionTitle = title;
      continue;
    }

    if (inBioSection) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && colonIdx < line.length - 1) {
        const key = line.slice(0, colonIdx).trim().toLowerCase();
        const value = line.slice(colonIdx + 1).trim();

        if (key === 'name' || key === 'full name') {
          detectedFields.name = value;
        } else if (key === 'email' || key === 'e-mail') {
          detectedFields.email = value;
        } else if (key === 'phone' || key === 'tel' || key === 'mobile') {
          detectedFields.phone = value;
        } else if (key === 'url' || key === 'website' || key === 'link') {
          detectedFields.url = value;
        }

        result.push(`Name: ${value}`);
        continue;
      }

      const emailMatch = line.match(EMAIL_REGEX);
      if (emailMatch && !detectedFields.email) {
        detectedFields.email = emailMatch[0];
        result.push(`Email: ${emailMatch[0]}`);
        continue;
      }

      const phoneMatch = line.match(PHONE_REGEX);
      if (phoneMatch && !detectedFields.phone) {
        detectedFields.phone = phoneMatch[0];
        result.push(`Phone: ${phoneMatch[0]}`);
        continue;
      }

      const urlMatch = line.match(URL_REGEX);
      if (urlMatch && !detectedFields.url) {
        detectedFields.url = urlMatch[0];
        result.push(`URL: ${urlMatch[0]}`);
        continue;
      }

      if (line.includes('@') && !detectedFields.email) {
        const atParts = line.split('@');
        if (
          atParts.length >= 2 &&
          atParts[0].length > 0 &&
          atParts[1].includes('.')
        ) {
          const possibleEmail = line.match(EMAIL_REGEX)?.[0];
          if (possibleEmail) {
            detectedFields.email = possibleEmail;
            result.push(`Email: ${possibleEmail}`);
            continue;
          }
        }
      }

      result.push(line);
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const bulletContent = line.slice(2).trim();
      result.push(`- ${bulletContent}`);
      continue;
    }

    if (line.match(/^\d+\.?\s/)) {
      const numberedContent = line.replace(/^\d+\.?\s*/, '').trim();
      result.push(`- ${numberedContent}`);
      continue;
    }

    if (line.includes('@') && detectYearInLine(line)) {
      const atIdx = line.indexOf('@');
      const possibleRole = line.slice(0, atIdx).trim();
      const rest = line.slice(atIdx + 1).trim();
      const dateMatch = detectYearInLine(rest);
      if (possibleRole && dateMatch) {
        const org = rest
          .replace(dateMatch, '')
          .replace(/\s*\|\s*/, '')
          .trim();
        result.push(`## ${possibleRole} @ ${org} | ${dateMatch}`);
        continue;
      }
    }

    if (detectYearInLine(line)) {
      const yearMatch = detectYearInLine(line);
      const withoutYear = line
        .replace(yearMatch!, '')
        .replace(/[-–|]+/, ' ')
        .trim();
      if (withoutYear && withoutYear.length > 2) {
        result.push(`## ${withoutYear} | ${yearMatch}`);
        continue;
      }
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && colonIdx < line.length - 1) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      result.push(`${key}: ${value}`);
      continue;
    }

    result.push(line);
  }

  const rawContent = result.join('\n');

  return { rawContent, detectedFields };
}
