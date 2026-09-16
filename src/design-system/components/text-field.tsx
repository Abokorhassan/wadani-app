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
  containerStyle?: StyleProp<ViewStyle>;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, hint, optional, prefix, containerStyle, onFocus, onBlur, ...inputProps },
  ref
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.color.danger
    : focused
      ? theme.color.action
      : theme.color.border;

  return (
    <View style={[{ marginBottom: theme.spacing.lg }, containerStyle]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
        <Text variant="smallStrong" color="textSecondary">
          {label}
        </Text>
        {optional ? (
          <Text variant="caption" color="textMuted">
            optional
          </Text>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: theme.spacing.xs + 2,
          borderWidth: 1.5,
          borderColor,
          borderRadius: theme.radius.md,
          backgroundColor: theme.color.surface,
          paddingHorizontal: theme.spacing.md,
          minHeight: theme.hitSize + 6,
        }}>
        {prefix ? (
          <Text variant="body" color="textSecondary" style={{ marginRight: theme.spacing.sm }}>
            {prefix}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          style={[
            theme.typography.body,
            { flex: 1, color: theme.color.text, paddingVertical: theme.spacing.md },
          ]}
          placeholderTextColor={theme.color.textMuted}
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
      </View>

      {error ? (
        <Text variant="caption" color="danger" style={{ marginTop: theme.spacing.xs }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted" style={{ marginTop: theme.spacing.xs }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

export function PasswordField(props: TextFieldProps) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(true);

  return (
    <View>
      <TextField
        {...props}
        secureTextEntry={hidden}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
      />
      <Pressable
        onPress={() => setHidden((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
        hitSlop={8}
        style={{ position: 'absolute', right: theme.spacing.md, top: theme.spacing.xl + 6 }}>
        {hidden ? (
          <EyeOff size={20} color={theme.color.textMuted} />
        ) : (
          <Eye size={20} color={theme.color.textMuted} />
        )}
      </Pressable>
    </View>
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
