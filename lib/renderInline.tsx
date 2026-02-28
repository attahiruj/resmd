import React from 'react'
import { parseInline } from './inline'

export function renderInline(text: string): React.ReactNode {
  const segments = parseInline(text)
  if (segments.length === 1 && !segments[0].bold && !segments[0].italic && !segments[0].underline) {
    return text
  }
  return segments.map((seg, i) => {
    if (seg.bold) return <strong key={i}>{seg.text}</strong>
    if (seg.italic) return <em key={i}>{seg.text}</em>
    if (seg.underline) return <u key={i}>{seg.text}</u>
    return seg.text
  })
}
