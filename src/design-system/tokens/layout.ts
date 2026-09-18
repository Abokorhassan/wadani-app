import type { ViewStyle } from 'react-native';

/** 4pt spacing scale. Screens use `gutter` for their side padding. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  gutter: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  /** Icon tiles. */
  md: 14,
  /** Inputs. */
  lg: 16,
  /** Buttons. */
  button: 18,
  /** Cards and list groups. */
  card: 22,
  /** Hero cards (membership card, plan card). */
  hero: 26,
  sheet: 34,
  pill: 999,
} as const;

/** Minimum tap target, per platform accessibility guidance. */
export const hitSize = 44;

/** Control heights from the mockups. */
export const controlHeight = {
  field: 56,
  button: 56,
  chip: 44,
} as const;

/** CSS-style shadows (React Native's `boxShadow`, New Architecture). */
export const shadow = {
  hairline: { boxShadow: '0px 1px 2px rgba(26, 21, 18, 0.04)' },
  raised: {
    boxShadow: '0px 1px 2px rgba(26, 21, 18, 0.06), 0px 6px 14px -6px rgba(26, 21, 18, 0.16)',
  },
  float: { boxShadow: '0px 18px 40px -16px rgba(26, 21, 18, 0.22)' },
  action: { boxShadow: '0px 12px 24px -14px rgba(85, 101, 47, 0.75)' },
  brand: { boxShadow: '0px 24px 40px -22px rgba(190, 90, 0, 0.8)' },
  ticket: {
    boxShadow: '0px 1px 2px rgba(26, 21, 18, 0.05), 0px 34px 60px -30px rgba(120, 60, 10, 0.45)',
  },
  ink: { boxShadow: '0px 24px 44px -24px rgba(26, 21, 18, 0.6)' },
} satisfies Record<string, ViewStyle>;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
