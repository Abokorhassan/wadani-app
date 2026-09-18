import { createContext, useContext } from 'react';

import { palette } from './tokens/colors';
import { controlHeight, hitSize, radius, shadow, spacing } from './tokens/layout';
import { fonts, typography } from './tokens/typography';

/**
 * Semantic roles. Screens and components use these, never raw palette values,
 * so a dark theme later only means adding a second object here.
 */
export const lightTheme = {
  mode: 'light' as const,
  color: {
    background: palette.ground,
    surface: palette.white,
    surfaceWarm: palette.cream,
    surfaceSunken: palette.sunken,
    /** Dark premium surfaces: plan card, invite banner. */
    surfaceInk: palette.ink,

    border: palette.line,
    borderStrong: palette.lineStrong,
    fieldBorder: palette.fieldLine,

    text: palette.ink,
    textSecondary: palette.inkSoft,
    textMuted: palette.muted,
    textPlaceholder: palette.faint,
    /** On orange surfaces: white would fail contrast, so text stays dark. */
    textOnBrand: palette.ink,
    textOnBrandSoft: palette.onOrangeSoft,
    /** On green / brown surfaces. */
    textOnAction: palette.white,
    textOnInk: palette.cream,
    textOnInkSoft: palette.onInkSoft,
    textOnInkFaint: palette.onInkFaint,

    brand: palette.orange,
    /** Orange for icons on tints. Never small text. */
    brandDeep: palette.orangeDeep,
    brandTint: palette.orangeTint,

    action: palette.green,
    actionDeep: palette.greenDeep,
    actionTint: palette.greenTint,

    accent: palette.brown,
    accentDeep: palette.brownDeep,
    accentTint: palette.brownTint,

    success: palette.success,
    successTint: palette.successTint,
    warning: palette.warning,
    warningTint: palette.warningTint,
    danger: palette.danger,
    dangerTint: palette.dangerTint,
    info: palette.info,
    infoTint: palette.infoTint,

    whatsapp: palette.whatsapp,
    textOnWhatsappSoft: palette.onWhatsappSoft,

    ticketBorder: palette.ticketLine,
    ticketFooter: palette.ticketFoot,

    overlay: palette.overlay,
  },
  spacing,
  radius,
  shadow,
  fonts,
  typography,
  hitSize,
  controlHeight,
};

export type Theme = typeof lightTheme;
export type ColorRole = keyof Theme['color'];

const ThemeContext = createContext<Theme>(lightTheme);

export const ThemeProvider = ThemeContext.Provider;

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
