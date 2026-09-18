import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './text';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Bottom padding a tab screen needs so its content clears the floating bar. */
export const TAB_BAR_CLEARANCE = 140;

/** Floating rounded tab bar from the mockups; pass as `<Tabs tabBar={...}>`. */
export function FloatingTabBar({ state, descriptors, navigation, insets }: TabBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          position: 'absolute',
          left: theme.spacing.lg,
          right: theme.spacing.lg,
          bottom: Math.max(insets.bottom, 12) + 8,
          height: 68,
          padding: 6,
          gap: 4,
          flexDirection: 'row',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: theme.color.border,
          backgroundColor: theme.color.surface,
        },
        theme.shadow.float,
      ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused ? theme.color.actionDeep : theme.color.textMuted;
        const label = typeof options.title === 'string' ? options.title : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              borderRadius: 18,
              backgroundColor: focused ? theme.color.actionTint : 'transparent',
            }}>
            {options.tabBarIcon?.({ focused, color, size: 22 })}
            <Text
              variant="tab"
              style={{ color, fontFamily: focused ? theme.fonts.text700 : theme.fonts.text600 }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
