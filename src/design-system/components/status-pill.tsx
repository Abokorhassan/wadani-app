import { View } from 'react-native';

import { useTheme, type Theme } from '../theme';
import { Text } from './text';

export type StatusTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

export interface StatusPillProps {
  label: string;
  tone?: StatusTone;
}

function toneColors(theme: Theme, tone: StatusTone) {
  switch (tone) {
    case 'brand':
      return { background: theme.color.brandTint, text: theme.color.brandDark };
    case 'success':
      return { background: theme.color.successTint, text: theme.color.success };
    case 'warning':
      return { background: theme.color.warningTint, text: theme.color.warning };
    case 'danger':
      return { background: theme.color.dangerTint, text: theme.color.danger };
    case 'info':
      return { background: theme.color.infoTint, text: theme.color.info };
    default:
      return { background: theme.color.surfaceSunken, text: theme.color.textSecondary };
  }
}

export function StatusPill({ label, tone = 'neutral' }: StatusPillProps) {
  const theme = useTheme();
  const colors = toneColors(theme, tone);

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: colors.background,
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
      }}>
      <Text variant="overline" style={{ color: colors.text }}>
        {label}
      </Text>
    </View>
  );
}
