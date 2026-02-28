export interface Segment {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

export function parseInline(text: string): Segment[] {
  const segments: Segment[] = []
  const regex = /\*([^*]+)\*|~([^~]+)~|_([^_]+)_/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ text: text.slice(last, match.index) })
    }
    if (match[1] !== undefined) segments.push({ text: match[1], bold: true })
    else if (match[2] !== undefined) segments.push({ text: match[2], italic: true })
    else if (match[3] !== undefined) segments.push({ text: match[3], underline: true })
    last = match.index + match[0].length
  }

  if (last < text.length) segments.push({ text: text.slice(last) })
  return segments.length ? segments : [{ text }]
}
