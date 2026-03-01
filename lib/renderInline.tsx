import React from 'react'
import { parseInline } from './inline'

export function renderInline(text: string): React.ReactNode {
  const segments = parseInline(text)
  if (segments.length === 1 && !segments[0].bold && !segments[0].italic && !segments[0].underline && !segments[0].placeholder && !segments[0].href) {
    return text
  }
  return segments.map((seg, i) => {
    if (seg.href) return <a key={i} href={seg.href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>↗ {seg.text}</a>
    if (seg.bold) return <strong key={i}>{seg.text}</strong>
    if (seg.italic) return <em key={i}>{seg.text}</em>
    if (seg.underline) return <u key={i}>{seg.text}</u>
    if (seg.placeholder) return <span key={i} style={{ color: '#ef4444', fontWeight: 500 }}>{seg.text}</span>
    return seg.text
  })
}
