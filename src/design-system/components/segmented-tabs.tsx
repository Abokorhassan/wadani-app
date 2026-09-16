import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './text';

export interface SegmentedTabItem<T extends string = string> {
  key: T;
  label: string;
  icon?: LucideIcon;
}

export interface SegmentedTabsProps<T extends string = string> {
  items: SegmentedTabItem<T>[];
  value: T;
  onChange: (key: T) => void;
  testID?: string;
}

export function SegmentedTabs<T extends string = string>({
  items,
  value,
  onChange,
  testID,
}: SegmentedTabsProps<T>) {
  const theme = useTheme();

  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        gap: theme.spacing.xs,
        padding: theme.spacing.xs,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.color.surfaceSunken,
      }}>
      {items.map((item) => {
        const active = item.key === value;
        const Icon = item.icon;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing.xs + 2,
              paddingVertical: theme.spacing.sm + 2,
              borderRadius: theme.radius.pill,
              backgroundColor: active ? theme.color.surface : 'transparent',
              ...(active ? theme.shadow.low : null),
            }}>
            {Icon ? (
              <Icon size={16} color={active ? theme.color.action : theme.color.textMuted} />
            ) : null}
            <Text variant="smallStrong" color={active ? 'action' : 'textMuted'}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
