/**
 * Raw brand palette.
 *
 * `orange` is the party's official brand colour. The other brand values are
 * sampled from the official logo artwork (see docs/build-plan.md §6).
 *
 * Contrast note: white on orange is only ~2.6:1, so orange is a *surface*
 * colour that carries dark text. Green (~4.9:1 with white) carries actions.
 */
export const palette = {
  orange: '#FE7B00',
  orangeDark: '#E06B00',
  orangePressed: '#C95F00',
  orangeTint: '#FFF1E3',

  green: '#66783C',
  greenDark: '#55642F',
  greenTint: '#EEF1E5',

  brown: '#996353',
  cream: '#FFEFDB',
  sand: '#E3CFB6',

  ink: '#1A1512',
  inkSoft: '#514941',
  muted: '#8A807A',

  white: '#FFFFFF',
  offWhite: '#FBF8F4',
  sunken: '#F3EDE5',
  border: '#E8E0D6',
  borderStrong: '#D6CBBD',

  success: '#2E7D4F',
  successTint: '#E7F3EC',
  warning: '#9A6B00',
  warningTint: '#FFF4DF',
  danger: '#B3261E',
  dangerTint: '#FDECEA',
  info: '#2A6EBB',
  infoTint: '#E8F0FA',

  overlay: 'rgba(26, 21, 18, 0.55)',
} as const;

export type Palette = typeof palette;
