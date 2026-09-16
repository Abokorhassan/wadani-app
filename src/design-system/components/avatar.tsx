import { Image } from 'expo-image';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './text';

export interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  /** Ring colour, used on the membership card. */
  ringColor?: string;
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ name, uri, size = 48, ringColor }: AvatarProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.color.brandTint,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: ringColor ? 3 : 0,
        borderColor: ringColor,
      }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <Text
          variant="bodyStrong"
          color="brandDark"
          style={{ fontSize: size * 0.36, lineHeight: size * 0.44 }}>
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}
