import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { IconButton } from './icon-button';
import { Text } from './text';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Shows a back button that pops the current screen. */
  back?: boolean;
  /** Element at the top right, e.g. a notifications button. */
  action?: React.ReactNode;
}

/** Large-title header from the mockups: optional back row, then title and subtitle. */
export function ScreenHeader({ title, subtitle, back = false, action }: ScreenHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={{ paddingTop: theme.spacing.md }}>
      {back || action ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.lg + 2,
          }}>
          {back ? (
            <IconButton
              icon={ChevronLeft}
              accessibilityLabel="Back"
              onPress={() => router.back()}
            />
          ) : (
            <View />
          )}
          {action}
        </View>
      ) : null}
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="subtitle" color="textMuted" style={{ marginTop: 6 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
