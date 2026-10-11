import { createContext, useContext } from 'react';

import { darkPalette, palette } from './tokens/colors';
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
    /** The chosen option in a segmented control, lifted off its track. */
    surfaceSelected: palette.white,
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
    textOnWhatsapp: palette.ink,
    textOnWhatsappSoft: palette.onWhatsappSoft,

    dangerPressed: '#F8D9D5',

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

/** A theme: the same roles in every mode, each holding any colour. */
export type Theme = Omit<typeof lightTheme, 'mode' | 'color'> & {
  mode: 'light' | 'dark';
  color: Record<keyof typeof lightTheme.color, string>;
};
export type ColorRole = keyof Theme['color'];

const dp = darkPalette;

/** Same roles, dark values. Brand orange and its ink text are unchanged. */
export const darkTheme: Theme = {
  ...lightTheme,
  mode: 'dark',
  color: {
    ...lightTheme.color,
    background: dp.ground,
    surface: dp.surface,
    surfaceWarm: dp.cream,
    surfaceSunken: dp.sunken,
    surfaceSelected: dp.selected,
    // The "ink" cards (plan, invite) lift off the page instead of vanishing into it.
    surfaceInk: dp.surfaceRaised,

    border: dp.line,
    borderStrong: dp.lineStrong,
    fieldBorder: dp.fieldLine,

    text: dp.text,
    textSecondary: dp.textSoft,
    textMuted: dp.muted,
    textPlaceholder: dp.faint,

    brandDeep: dp.orangeDeep,
    brandTint: dp.orangeTint,
    actionDeep: dp.greenDeep,
    actionTint: dp.greenTint,
    accent: dp.brown,
    accentDeep: dp.brownDeep,
    accentTint: dp.brownTint,

    success: dp.success,
    successTint: dp.successTint,
    warning: dp.warning,
    warningTint: dp.warningTint,
    danger: dp.danger,
    dangerTint: dp.dangerTint,
    dangerPressed: dp.dangerPressed,
    info: dp.info,
    infoTint: dp.infoTint,

    ticketBorder: dp.ticketLine,
    ticketFooter: dp.ticketFoot,
    overlay: dp.overlay,
  },
};

export type ThemeMode = Theme['mode'];

const ThemeContext = createContext<Theme>(lightTheme);

export const ThemeProvider = ThemeContext.Provider;

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
