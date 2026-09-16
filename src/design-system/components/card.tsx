import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  tone?: 'surface' | 'warm' | 'brandTint';
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
      : tone === 'brandTint'
        ? theme.color.brandTint
        : theme.color.surface;

  const base: StyleProp<ViewStyle> = [
    {
      backgroundColor: background,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.color.border,
      padding: padded ? theme.spacing.lg : 0,
      overflow: 'hidden',
    },
    style,
  ];

  if (!onPress) {
    return (
      <View style={base} testID={testID}>
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
      style={({ pressed }) => [base, pressed && { backgroundColor: theme.color.surfaceSunken }]}>
      {children}
    </Pressable>
  );
}
