import { BlurTargetView, BlurView } from 'expo-blur';
import type { Tabs } from 'expo-router';
import { createRef, type ComponentProps, type ReactNode, type RefObject } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './text';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Bottom padding a tab screen needs so its content clears the floating bar. */
export const TAB_BAR_CLEARANCE = 140;

/*
 * Android blurs only what sits inside a BlurTargetView, and the bar itself must
 * stay outside it. So every tab screen is wrapped in its own target (see
 * `TabBlurTarget`, passed as the navigator's `screenLayout`) and the bar blurs
 * the one on screen. iOS blurs whatever is behind and ignores the target.
 */
const targets = new Map<string, RefObject<View | null>>();

function blurTargetFor(routeKey: string): RefObject<View | null> {
  let target = targets.get(routeKey);
  if (!target) {
    target = createRef<View>();
    targets.set(routeKey, target);
  }
  return target;
}

/** Wraps a tab screen so the floating bar can blur it. Pass as `screenLayout`. */
export function TabBlurTarget({
  route,
  children,
}: {
  route: { key: string };
  children: ReactNode;
}) {
  return (
    <BlurTargetView ref={blurTargetFor(route.key)} style={{ flex: 1 }}>
      {children}
    </BlurTargetView>
  );
}

/** Floating rounded tab bar from the mockups; pass as `<Tabs tabBar={...}>`. */
export function FloatingTabBar({ state, descriptors, navigation, insets }: TabBarProps) {
  const theme = useTheme();
  const dark = theme.mode === 'dark';

  return (
    <View
      style={[
        {
          position: 'absolute',
          left: theme.spacing.lg,
          right: theme.spacing.lg,
          bottom: Math.max(insets.bottom, 12) + 8,
          height: 68,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: theme.color.border,
          overflow: 'hidden',
        },
        theme.shadow.float,
      ]}>
      {/* The page scrolls on beneath, blurred, so the bar reads as glass over it. */}
      <BlurView
        blurTarget={blurTargetFor(state.routes[state.index].key)}
        blurMethod="dimezisBlurViewSdk31Plus"
        intensity={dark ? 60 : 70}
        tint={dark ? 'dark' : 'light'}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      {/* A wash of the surface colour keeps the labels readable over busy content. */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: theme.color.surface,
          opacity: dark ? 0.45 : 0.5,
        }}
      />
      <View style={{ flex: 1, flexDirection: 'row', padding: 6, gap: 4 }}>
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
    </View>
  );
}
