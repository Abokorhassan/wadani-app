import type { TextStyle } from 'react-native';

/**
 * Font faces, loaded in the root layout from @expo-google-fonts.
 * Custom fonts ship one file per weight, so weight lives in the family name
 * and `fontWeight` is never set alongside them.
 */
export const fonts = {
  display700: 'BricolageGrotesque_700Bold',
  display800: 'BricolageGrotesque_800ExtraBold',
  text400: 'Figtree_400Regular',
  text500: 'Figtree_500Medium',
  text600: 'Figtree_600SemiBold',
  text700: 'Figtree_700Bold',
  mono500: 'IBMPlexMono_500Medium',
  mono600: 'IBMPlexMono_600SemiBold',
} as const;

/** Bricolage is set tight, as in the mockups (-0.02em). */
const tight = (size: number) => -0.02 * size;

/** Type scale. Every text style in the app comes from here. */
export const typography = {
  /** Welcome / login headline. */
  hero: { fontFamily: fonts.display800, fontSize: 38, lineHeight: 42, letterSpacing: tight(38) },
  /** Screen titles. */
  title: { fontFamily: fonts.display700, fontSize: 32, lineHeight: 36, letterSpacing: tight(32) },
  /** Member name on the card, big figures. */
  display: {
    fontFamily: fonts.display700,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: tight(28),
  },
  headline: {
    fontFamily: fonts.display700,
    fontSize: 23,
    lineHeight: 28,
    letterSpacing: tight(23),
  },
  heading: { fontFamily: fonts.display700, fontSize: 19, lineHeight: 24, letterSpacing: tight(19) },
  /** Wordmark-style caps next to the seal. */
  brand: { fontFamily: fonts.display800, fontSize: 15, lineHeight: 18, letterSpacing: 0.9 },
  amount: { fontFamily: fonts.display800, fontSize: 58, lineHeight: 60, letterSpacing: tight(58) },

  body: { fontFamily: fonts.text400, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fonts.text500, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.text700, fontSize: 16, lineHeight: 20 },
  subtitle: { fontFamily: fonts.text400, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.text500, fontSize: 14, lineHeight: 20 },
  smallStrong: { fontFamily: fonts.text700, fontSize: 15, lineHeight: 20 },
  label: { fontFamily: fonts.text600, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fonts.text500, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fonts.text600, fontSize: 12, lineHeight: 16 },
  tab: { fontFamily: fonts.text600, fontSize: 11, lineHeight: 14 },
  overline: {
    fontFamily: fonts.text700,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  button: { fontFamily: fonts.text700, fontSize: 16, lineHeight: 20 },
  mono: { fontFamily: fonts.mono600, fontSize: 15, lineHeight: 20, letterSpacing: 0.6 },
  monoSmall: { fontFamily: fonts.mono500, fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
