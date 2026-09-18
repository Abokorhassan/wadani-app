/**
 * Raw brand palette, matching the approved mockups (design/app-screens).
 *
 * `orange` is the party's official brand colour. The other brand values are
 * sampled from the official logo artwork (see docs/build-plan.md §6).
 *
 * Contrast rules:
 * - White on orange is ~2.6:1, so orange is a *surface* that carries ink text.
 * - Green (~4.9:1 with white) carries actions.
 * - Small text on a tint uses the matching "deep" colour, never the base hue.
 */
export const palette = {
  orange: '#FE7B00',
  orangeDeep: '#D96A00',
  orangeTint: '#FFF0E0',
  /** Secondary text on orange surfaces (ink at ~80%). */
  onOrangeSoft: '#4A2C10',

  green: '#66783C',
  greenDeep: '#55652F',
  greenTint: '#EEF1E3',

  brown: '#996353',
  brownDeep: '#7E4F41',
  brownTint: '#F5EAE5',
  cream: '#FFEFDB',
  sand: '#E3CFB6',

  ink: '#1A1512',
  inkSoft: '#52483F',
  muted: '#766B62',
  faint: '#A0958B',
  /** Secondary text on ink surfaces. */
  onInkSoft: '#BFB3A6',
  onInkFaint: '#8C8177',

  white: '#FFFFFF',
  ground: '#FBF8F4',
  sunken: '#F3ECE4',
  line: '#ECE3D9',
  lineStrong: '#DCD0C2',
  fieldLine: '#E4DACE',
  ticketLine: '#EFE6DB',
  ticketFoot: '#FBF4EA',

  success: '#2E7A4D',
  successTint: '#E5F2EA',
  warning: '#946000',
  warningTint: '#FFF2D9',
  danger: '#B3261E',
  dangerTint: '#FCEAE8',
  info: '#2A6EBB',
  infoTint: '#E8F0FA',

  whatsapp: '#25D366',
  onWhatsappSoft: '#0B3D1F',

  overlay: 'rgba(26, 21, 18, 0.55)',
} as const;

export type Palette = typeof palette;
