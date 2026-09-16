import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme, type Theme } from '../theme';
import type { TypographyVariant } from '../tokens/typography';

type ColorRole = Extract<
  keyof Theme['color'],
  | 'text'
  | 'textSecondary'
  | 'textMuted'
  | 'textOnBrand'
  | 'textOnAction'
  | 'brandDark'
  | 'action'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
>;

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorRole;
  center?: boolean;
}

export function Text({ variant = 'body', color = 'text', center, style, ...rest }: TextProps) {
  const theme = useTheme();
  return (
    <RNText
      style={[
        theme.typography[variant] as TextStyle,
        { color: theme.color[color] },
        center && { textAlign: 'center' },
        style,
      ]}
      {...rest}
    />
  );
}
