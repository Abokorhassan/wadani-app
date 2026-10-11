import { useState } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import { TAB_BAR_CLEARANCE } from './tab-bar';

/** Room left between the keyboard (or the footer above it) and the field being typed in. */
const FIELD_CLEARANCE = 24;

export interface ScreenProps {
  children: React.ReactNode;
  /** Scrolls by default. Set false for screens that manage their own list. */
  scroll?: boolean;
  padded?: boolean;
  /** Leaves room under the content for the floating tab bar. */
  withTabBar?: boolean;
  /** Pinned below the scroll area, e.g. wizard navigation buttons. */
  footer?: React.ReactNode;
  edges?: readonly Edge[];
  background?: 'background' | 'surface' | 'brand';
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ComponentProps<typeof ScrollView>['refreshControl'];
  testID?: string;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  withTabBar = false,
  footer,
  edges = ['top', 'bottom', 'left', 'right'],
  background = 'background',
  contentStyle,
  refreshControl,
  testID,
}: ScreenProps) {
  const theme = useTheme();
  const [footerHeight, setFooterHeight] = useState(0);
  const backgroundColor =
    background === 'brand'
      ? theme.color.brand
      : background === 'surface'
        ? theme.color.surface
        : theme.color.background;

  const padding: ViewStyle = {
    paddingHorizontal: padded ? theme.spacing.gutter : 0,
    paddingBottom: withTabBar ? TAB_BAR_CLEARANCE : theme.spacing.xl,
  };
  const safeEdges = withTabBar ? edges.filter((edge) => edge !== 'bottom') : edges;

  return (
    <SafeAreaView edges={safeEdges} style={{ flex: 1, backgroundColor }} testID={testID}>
      {scroll ? (
        /*
         * Scrolls the whole field being typed in into view above the keyboard,
         * and above the pinned footer when there is one. Only keeping the
         * caret in view, as before, left the field's border, label and error
         * half hidden (2026-10-11).
         */
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[{ flexGrow: 1 }, padding, contentStyle]}
          bottomOffset={(footer ? footerHeight : 0) + FIELD_CLEARANCE}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}>
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
        </KeyboardAvoidingView>
      )}

      {footer ? (
        // Rides up with the keyboard, so "Next" stays reachable while typing. No
        // offset for the open state: a floating keyboard reports no height while
        // "open", and an offset then pushed the buttons down under the nav bar.
        <KeyboardStickyView>
          <View
            onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
            style={{
              paddingHorizontal: theme.spacing.gutter,
              paddingTop: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              backgroundColor,
            }}>
            {footer}
          </View>
        </KeyboardStickyView>
      ) : null}
    </SafeAreaView>
  );
}
