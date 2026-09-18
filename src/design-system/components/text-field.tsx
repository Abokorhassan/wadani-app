import { Eye, EyeOff } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme';
import { Text } from './text';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  /** Static text shown before the input, e.g. a dialling code. */
  prefix?: string;
  /** Element at the end of the input, e.g. a show-password toggle. */
  trailing?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    error,
    hint,
    optional,
    prefix,
    trailing,
    containerStyle,
    onFocus,
    onBlur,
    ...inputProps
  },
  ref
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.color.danger
    : focused
      ? theme.color.action
      : theme.color.fieldBorder;

  return (
    <View style={[{ gap: theme.spacing.sm }, containerStyle]}>
      <View
        style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text variant="label" color="textSecondary">
          {label}
        </Text>
        {optional ? (
          <Text variant="captionStrong" color="textMuted">
            Optional
          </Text>
        ) : null}
      </View>

      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            height: theme.controlHeight.field,
            paddingHorizontal: theme.spacing.lg,
            borderWidth: 1.5,
            borderColor,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.color.surface,
          },
          focused && !error ? { boxShadow: '0px 0px 0px 4px rgba(102, 120, 60, 0.14)' } : null,
        ]}>
        {prefix ? (
          <>
            <Text variant="bodyMedium" style={{ fontFamily: theme.fonts.text600 }}>
              {prefix}
            </Text>
            <View style={{ width: 1, height: 24, backgroundColor: theme.color.borderStrong }} />
          </>
        ) : null}
        <TextInput
          ref={ref}
          style={[
            theme.typography.bodyMedium,
            { flex: 1, color: theme.color.text, paddingVertical: 0 },
          ]}
          placeholderTextColor={theme.color.textPlaceholder}
          selectionColor={theme.color.action}
          cursorColor={theme.color.action}
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {trailing}
      </View>

      {error ? (
        <Text variant="caption" color="danger" style={{ fontFamily: theme.fonts.text600 }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

export function PasswordField(props: TextFieldProps) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(true);
  const Icon = hidden ? EyeOff : Eye;

  return (
    <TextField
      {...props}
      secureTextEntry={hidden}
      autoCapitalize="none"
      autoComplete="password"
      autoCorrect={false}
      trailing={
        <Pressable
          onPress={() => setHidden((value) => !value)}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          hitSlop={12}>
          <Icon size={20} color={theme.color.textMuted} />
        </Pressable>
      }
    />
  );
}

/** Phone input with the Somaliland dialling code shown as a prefix. */
export function PhoneField(props: TextFieldProps) {
  return (
    <TextField
      keyboardType="phone-pad"
      autoComplete="tel"
      prefix="+252"
      placeholder="63 234 5678"
      {...props}
    />
  );
}
