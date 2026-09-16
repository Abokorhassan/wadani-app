import { Platform, type TextStyle } from 'react-native';

const monoFamily = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

/** Type scale. Every text style in the app comes from here. */
export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  smallStrong: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  mono: { fontSize: 14, lineHeight: 20, fontFamily: monoFamily, letterSpacing: 1 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
