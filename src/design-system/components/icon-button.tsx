import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';

export interface IconButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress?: () => void;
  /** Small orange dot, e.g. unread notifications. */
  badge?: boolean;
  testID?: string;
}

/** 44pt round button used for back, notifications and similar header actions. */
export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  badge,
  testID,
}: IconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => ({
        width: theme.hitSize,
        height: theme.hitSize,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: pressed ? theme.color.surfaceSunken : theme.color.surface,
        alignItems: 'center',
        justifyContent: 'center',
      })}>
      <Icon size={22} color={theme.color.text} strokeWidth={2} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 9,
            width: 10,
            height: 10,
            borderRadius: theme.radius.pill,
            borderWidth: 2,
            borderColor: theme.color.surface,
            backgroundColor: theme.color.brand,
          }}
        />
      ) : null}
    </Pressable>
  );
}
