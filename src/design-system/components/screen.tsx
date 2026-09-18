import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import { TAB_BAR_CLEARANCE } from './tab-bar';

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[{ flexGrow: 1 }, padding, contentStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}>
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
        )}

        {footer ? (
          <View
            style={{
              paddingHorizontal: theme.spacing.gutter,
              paddingTop: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
            }}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
