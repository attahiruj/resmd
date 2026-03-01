import React from 'react';
import { Text, Link } from '@react-pdf/renderer';
import { parseInline } from './inline';

export function renderInlinePdf(text: string): React.ReactNode {
  const segments = parseInline(text);
  return segments.map((seg, i) => {
    if (seg.href)
      return (
        <Link
          key={i}
          src={seg.href}
          style={{ color: '#2563EB', textDecoration: 'none' }}
        >
          ↗ {seg.text}
        </Link>
      );
    if (seg.bold)
      return (
        <Text key={i} style={{ fontWeight: 'bold' }}>
          {seg.text}
        </Text>
      );
    if (seg.italic)
      return (
        <Text key={i} style={{ fontStyle: 'italic' }}>
          {seg.text}
        </Text>
      );
    if (seg.underline)
      return (
        <Text key={i} style={{ textDecoration: 'underline' }}>
          {seg.text}
        </Text>
      );
    return <Text key={i}>{seg.text}</Text>;
  });
}
