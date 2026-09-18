import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '../theme';

export type IconTileTone =
  'brand' | 'action' | 'accent' | 'neutral' | 'success' | 'warning' | 'surface';

export interface IconTileProps {
  icon: LucideIcon;
  tone?: IconTileTone;
  size?: number;
  round?: boolean;
}

/** Tinted rounded square holding an icon: tiles, list rows, payment methods. */
export function IconTile({
  icon: Icon,
  tone = 'neutral',
  size = 44,
  round = false,
}: IconTileProps) {
  const theme = useTheme();
  const [background, foreground] = {
    brand: [theme.color.brandTint, theme.color.brandDeep],
    action: [theme.color.actionTint, theme.color.actionDeep],
    accent: [theme.color.accentTint, theme.color.accent],
    neutral: [theme.color.surfaceSunken, theme.color.textSecondary],
    success: [theme.color.successTint, theme.color.success],
    warning: [theme.color.warningTint, theme.color.warning],
    surface: [theme.color.surface, theme.color.actionDeep],
  }[tone];

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: round ? theme.radius.pill : Math.round(size * 0.32),
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon size={Math.round(size * 0.5)} color={foreground} strokeWidth={2} />
    </View>
  );
}
