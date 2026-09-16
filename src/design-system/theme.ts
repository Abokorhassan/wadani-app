import { createContext, useContext } from 'react';

import { palette } from './tokens/colors';
import { hitSize, radius, shadow, spacing } from './tokens/layout';
import { typography } from './tokens/typography';

/**
 * Semantic roles. Screens and components use these, never raw palette values,
 * so a dark theme later only means adding a second object here.
 */
export const lightTheme = {
  mode: 'light' as const,
  color: {
    background: palette.offWhite,
    surface: palette.white,
    surfaceWarm: palette.cream,
    surfaceSunken: palette.sunken,

    border: palette.border,
    borderStrong: palette.borderStrong,

    text: palette.ink,
    textSecondary: palette.inkSoft,
    textMuted: palette.muted,
    /** On orange surfaces: white would fail contrast, so text stays dark. */
    textOnBrand: palette.ink,
    /** On green / brown surfaces. */
    textOnAction: palette.white,

    brand: palette.orange,
    brandDark: palette.orangeDark,
    brandPressed: palette.orangePressed,
    brandTint: palette.orangeTint,

    action: palette.green,
    actionPressed: palette.greenDark,
    actionTint: palette.greenTint,

    accent: palette.brown,

    success: palette.success,
    successTint: palette.successTint,
    warning: palette.warning,
    warningTint: palette.warningTint,
    danger: palette.danger,
    dangerTint: palette.dangerTint,
    info: palette.info,
    infoTint: palette.infoTint,

    overlay: palette.overlay,
  },
  spacing,
  radius,
  shadow,
  typography,
  hitSize,
};

export type Theme = typeof lightTheme;

const ThemeContext = createContext<Theme>(lightTheme);

export const ThemeProvider = ThemeContext.Provider;

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
