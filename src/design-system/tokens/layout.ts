import { Platform, type ViewStyle } from 'react-native';

/** 4pt spacing scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Minimum tap target, per platform accessibility guidance. */
export const hitSize = 44;

const elevation = (level: 1 | 2 | 3): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#2B1E12',
      shadowOpacity: [0.06, 0.1, 0.14][level - 1],
      shadowRadius: [6, 14, 24][level - 1],
      shadowOffset: { width: 0, height: [2, 6, 12][level - 1] },
    },
    default: { elevation: [1, 4, 8][level - 1] },
  })!;

export const shadow = {
  low: elevation(1),
  medium: elevation(2),
  high: elevation(3),
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
