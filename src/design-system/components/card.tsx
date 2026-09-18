import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  tone?: 'surface' | 'warm' | 'ink';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

export function Card({
  children,
  onPress,
  tone = 'surface',
  padded = true,
  style,
  accessibilityLabel,
  testID,
}: CardProps) {
  const theme = useTheme();
  const background =
    tone === 'warm'
      ? theme.color.surfaceWarm
      : tone === 'ink'
        ? theme.color.surfaceInk
        : theme.color.surface;

  const base: ViewStyle = {
    backgroundColor: background,
    borderRadius: theme.radius.card,
    borderWidth: tone === 'surface' ? 1 : 0,
    borderColor: theme.color.border,
    padding: padded ? theme.spacing.lg : 0,
    overflow: 'hidden',
  };

  if (!onPress) {
    return (
      <View style={[base, style]} testID={testID}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, style, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}
