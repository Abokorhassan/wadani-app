import { Image } from 'expo-image';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './text';

export interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  /** Corner radius; round by default. */
  radius?: number;
  tone?: 'warm' | 'action' | 'brand';
  style?: StyleProp<ViewStyle>;
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ name, uri, size = 48, radius, tone = 'warm', style }: AvatarProps) {
  const theme = useTheme();
  const [background, foreground] = {
    warm: [theme.color.surfaceWarm, theme.color.accentDeep],
    action: [theme.color.actionTint, theme.color.actionDeep],
    brand: [theme.color.brandTint, theme.color.accentDeep],
  }[tone];

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius ?? size / 2,
          backgroundColor: background,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <Text
          variant="heading"
          style={{
            color: foreground,
            fontSize: Math.round(size * 0.36),
            lineHeight: Math.round(size * 0.44),
            letterSpacing: -0.2,
          }}>
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}
