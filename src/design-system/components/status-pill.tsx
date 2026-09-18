import { View } from 'react-native';

import { useTheme, type Theme } from '../theme';
import { Text } from './text';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'ink' | 'onBrand';

export interface StatusPillProps {
  label: string;
  tone?: StatusTone;
  /** Leading dot, e.g. "● Active". */
  dot?: boolean;
  /** Pills hug the start of their row; pass 'center' inside centred layouts. */
  align?: 'flex-start' | 'center';
}

function toneColors(theme: Theme, tone: StatusTone) {
  switch (tone) {
    case 'success':
      return {
        background: theme.color.successTint,
        text: theme.color.success,
        dot: theme.color.success,
      };
    case 'warning':
      return {
        background: theme.color.warningTint,
        text: theme.color.warning,
        dot: theme.color.warning,
      };
    case 'danger':
      return {
        background: theme.color.dangerTint,
        text: theme.color.danger,
        dot: theme.color.danger,
      };
    case 'info':
      return { background: theme.color.infoTint, text: theme.color.info, dot: theme.color.info };
    case 'ink':
      return { background: theme.color.surfaceInk, text: theme.color.textOnInk, dot: '#A9C872' };
    case 'onBrand':
      return {
        background: 'rgba(26, 21, 18, 0.12)',
        text: theme.color.textOnBrand,
        dot: theme.color.textOnBrand,
      };
    default:
      return {
        background: theme.color.surfaceSunken,
        text: theme.color.textSecondary,
        dot: theme.color.textSecondary,
      };
  }
}

export function StatusPill({
  label,
  tone = 'neutral',
  dot = false,
  align = 'flex-start',
}: StatusPillProps) {
  const theme = useTheme();
  const colors = toneColors(theme, tone);

  return (
    <View
      style={{
        alignSelf: align,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 24,
        paddingHorizontal: 10,
        borderRadius: theme.radius.pill,
        backgroundColor: colors.background,
      }}>
      {dot ? (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.dot }} />
      ) : null}
      <Text variant="overline" style={{ color: colors.text, letterSpacing: 0.9 }}>
        {label}
      </Text>
    </View>
  );
}
