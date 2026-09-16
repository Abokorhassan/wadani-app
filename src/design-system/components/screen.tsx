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

export interface ScreenProps {
  children: React.ReactNode;
  /** Scrolls by default. Set false for screens that manage their own list. */
  scroll?: boolean;
  padded?: boolean;
  /** Pinned below the scroll area, e.g. wizard navigation buttons. */
  footer?: React.ReactNode;
  edges?: readonly Edge[];
  background?: 'background' | 'surface' | 'brand';
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  footer,
  edges = ['top', 'bottom', 'left', 'right'],
  background = 'background',
  contentStyle,
  testID,
}: ScreenProps) {
  const theme = useTheme();
  const backgroundColor =
    background === 'brand'
      ? theme.color.brand
      : background === 'surface'
        ? theme.color.surface
        : theme.color.background;

  const padding: ViewStyle = padded
    ? { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl }
    : {};

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor }} testID={testID}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[{ flexGrow: 1 }, padding, contentStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
        )}

        {footer ? (
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.md,
              borderTopWidth: 1,
              borderTopColor: theme.color.border,
              backgroundColor: theme.color.surface,
            }}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
