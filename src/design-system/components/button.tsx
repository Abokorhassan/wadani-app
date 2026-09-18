import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type Theme } from '../theme';
import { Text } from './text';

export type ButtonVariant = 'primary' | 'secondary' | 'brand' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  /** Buttons fill their container by default; set false for inline buttons. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function colorsFor(theme: Theme, variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        bg: theme.color.action,
        pressed: theme.color.actionDeep,
        border: theme.color.action,
        fg: theme.color.textOnAction,
      };
    case 'secondary':
      return {
        bg: theme.color.surface,
        pressed: theme.color.surfaceSunken,
        border: theme.color.borderStrong,
        fg: theme.color.text,
      };
    case 'brand':
      return {
        bg: theme.color.brand,
        pressed: theme.color.brandDeep,
        border: theme.color.brand,
        fg: theme.color.textOnBrand,
      };
    case 'ghost':
      return {
        bg: 'transparent',
        pressed: theme.color.actionTint,
        border: 'transparent',
        fg: theme.color.actionDeep,
      };
    case 'danger':
      return {
        bg: theme.color.dangerTint,
        pressed: '#F8D9D5',
        border: theme.color.dangerTint,
        fg: theme.color.danger,
      };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  block = true,
  style,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const c = colorsFor(theme, variant);
  const md = size === 'md';

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: md ? theme.controlHeight.button : theme.controlHeight.chip,
          paddingHorizontal: md ? 22 : 18,
          borderRadius: md ? theme.radius.button : theme.radius.pill,
          borderWidth: 1.5,
          borderColor: c.border,
          backgroundColor: pressed && !isDisabled ? c.pressed : c.bg,
          alignSelf: block ? 'stretch' : 'flex-start',
          opacity: isDisabled ? 0.5 : 1,
        },
        variant === 'primary' && !isDisabled ? theme.shadow.action : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={c.fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: md ? 10 : 8 }}>
          {Icon ? <Icon size={md ? 20 : 18} color={c.fg} strokeWidth={2} /> : null}
          <Text variant={md ? 'button' : 'smallStrong'} style={{ color: c.fg }}>
            {label}
          </Text>
          {IconRight ? <IconRight size={md ? 20 : 18} color={c.fg} strokeWidth={2} /> : null}
        </View>
      )}
    </Pressable>
  );
}
