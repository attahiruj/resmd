export interface Segment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  placeholder?: boolean;
  href?: string;
}

export function parseInline(text: string): Segment[] {
  const segments: Segment[] = [];
  // [text](url) must come before [text] to avoid the bracket being consumed as placeholder
  const regex =
    /\*([^*]+)\*|~([^~]+)~|_([^_]+)_|\[([^\]]+)\]\(([^)]+)\)|\[([^\]]+)\]/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ text: text.slice(last, match.index) });
    }
    if (match[1] !== undefined) segments.push({ text: match[1], bold: true });
    else if (match[2] !== undefined)
      segments.push({ text: match[2], italic: true });
    else if (match[3] !== undefined)
      segments.push({ text: match[3], underline: true });
    else if (match[4] !== undefined)
      segments.push({ text: match[4], href: match[5] });
    else if (match[6] !== undefined)
      segments.push({ text: `[${match[6]}]`, placeholder: true });
    last = match.index + match[0].length;
  }

  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments.length ? segments : [{ text }];
}

/** Returns true if the text is an http/https URL */
export function isUrl(text: string): boolean {
  return /^https?:\/\/\S+$/.test(text.trim());
}

/** Extracts link from a pure markdown-link string like [text](url), returns null otherwise */
export function extractLink(
  text: string
): { text: string; href: string } | null {
  const segments = parseInline(text.trim());
  if (segments.length === 1 && segments[0].href) {
    return { text: segments[0].text, href: segments[0].href };
  }
  return null;
}

/** Returns true if the text contains any AI placeholder brackets like [Your Name] */
export function hasPlaceholders(text: string): boolean {
  return /\[[^\]]+\](?!\()/.test(text);
}
