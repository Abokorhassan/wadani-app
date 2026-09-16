import type { LucideIcon } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme, type Theme } from '../theme';
import { Text } from './text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  /** Buttons fill their container by default; set false for inline buttons. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function colorsFor(theme: Theme, variant: ButtonVariant, pressed: boolean) {
  switch (variant) {
    case 'primary':
      return {
        background: pressed ? theme.color.actionPressed : theme.color.action,
        border: 'transparent',
        content: theme.color.textOnAction,
      };
    case 'secondary':
      return {
        background: pressed ? theme.color.surfaceSunken : theme.color.surface,
        border: theme.color.borderStrong,
        content: theme.color.text,
      };
    case 'ghost':
      return {
        background: pressed ? theme.color.actionTint : 'transparent',
        border: 'transparent',
        content: theme.color.action,
      };
    case 'danger':
      return {
        background: pressed ? theme.color.danger : theme.color.dangerTint,
        border: 'transparent',
        content: pressed ? theme.color.surface : theme.color.danger,
      };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  block = true,
  style,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => {
        const c = colorsFor(theme, variant, pressed && !isDisabled);
        return [
          styles.base,
          {
            backgroundColor: c.background,
            borderColor: c.border,
            borderRadius: theme.radius.md,
            paddingVertical: size === 'md' ? theme.spacing.lg - 2 : theme.spacing.sm + 1,
            paddingHorizontal: size === 'md' ? theme.spacing.xl : theme.spacing.lg,
            minHeight: size === 'md' ? theme.hitSize + 6 : theme.hitSize - 8,
            alignSelf: block ? 'stretch' : 'flex-start',
            opacity: isDisabled ? 0.5 : 1,
          },
          style,
        ];
      }}>
      {({ pressed }) => {
        const c = colorsFor(theme, variant, pressed && !isDisabled);
        return (
          <View style={styles.content}>
            {loading ? (
              <ActivityIndicator size="small" color={c.content} />
            ) : (
              <>
                {Icon ? <Icon size={size === 'md' ? 18 : 16} color={c.content} /> : null}
                <Text
                  variant={size === 'md' ? 'bodyStrong' : 'smallStrong'}
                  style={{ color: c.content }}>
                  {label}
                </Text>
              </>
            )}
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
