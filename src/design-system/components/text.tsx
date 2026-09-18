import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme, type ColorRole } from '../theme';
import type { TypographyVariant } from '../tokens/typography';

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
