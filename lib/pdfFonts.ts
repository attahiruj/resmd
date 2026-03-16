import { Font } from '@react-pdf/renderer';
import path from 'path';

// Noto Sans — broad Unicode coverage (₦, ↗, and other non-Latin characters).
// Download from https://fonts.google.com/noto/specimen/Noto+Sans (Download family)
// and place the static TTF files in /public/fonts/:
//   NotoSans-Regular.ttf, NotoSans-Bold.ttf, NotoSans-Italic.ttf, NotoSans-BoldItalic.ttf
//
// Noto Sans Mono — monospace with Unicode coverage (Technical template).
// Download from https://fonts.google.com/noto/specimen/Noto+Sans+Mono (Download family)
// and place in /public/fonts/:
//   NotoSansMono-Regular.ttf, NotoSansMono-Bold.ttf

const dir = path.join(process.cwd(), 'public', 'fonts');

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: path.join(dir, 'NotoSans-Regular.ttf') },
    { src: path.join(dir, 'NotoSans-Bold.ttf'), fontWeight: 700 },
    { src: path.join(dir, 'NotoSans-Italic.ttf'), fontStyle: 'italic' },
    {
      src: path.join(dir, 'NotoSans-BoldItalic.ttf'),
      fontWeight: 700,
      fontStyle: 'italic',
    },
  ],
});

Font.register({
  family: 'NotoSansMono',
  fonts: [
    { src: path.join(dir, 'NotoSansMono-Regular.ttf') },
    { src: path.join(dir, 'NotoSansMono-Bold.ttf'), fontWeight: 700 },
  ],
});

Font.register({
  family: 'CourierPrime',
  fonts: [
    { src: path.join(dir, 'CourierPrime-Regular.ttf') },
    { src: path.join(dir, 'CourierPrime-Bold.ttf'), fontWeight: 700 },
    { src: path.join(dir, 'CourierPrime-Italic.ttf'), fontStyle: 'italic' },
    {
      src: path.join(dir, 'CourierPrime-BoldItalic.ttf'),
      fontWeight: 700,
      fontStyle: 'italic',
    },
  ],
});
