import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, type Theme } from '../theme';
import { Text } from './text';

export type ToastTone = 'neutral' | 'success' | 'danger';

interface ToastMessage {
  id: number;
  text: string;
  tone: ToastTone;
}

interface ToastApi {
  show: (text: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi>({ show: () => {} });

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

function toneColors(theme: Theme, tone: ToastTone) {
  switch (tone) {
    case 'success':
      return { background: theme.color.success, text: theme.color.textOnAction };
    case 'danger':
      return { background: theme.color.danger, text: theme.color.textOnAction };
    default:
      return { background: theme.color.text, text: theme.color.surface };
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<ToastMessage | null>(null);
  // Held in state, not a ref: the value is read during render for the style.
  const [opacity] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, tone: ToastTone = 'neutral') => {
    setMessage({ id: Date.now(), text, tone });
  }, []);

  useEffect(() => {
    if (!message) return;

    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(
        ({ finished }) => {
          if (finished) setMessage(null);
        }
      );
    }, 2600);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [message, opacity]);

  const api = useMemo(() => ({ show }), [show]);
  const colors = message ? toneColors(theme, message.tone) : null;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {message && colors ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={{
            position: 'absolute',
            left: theme.spacing.lg,
            right: theme.spacing.lg,
            bottom: insets.bottom + theme.spacing.xl,
            opacity,
            transform: [
              { translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
            ],
          }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              ...theme.shadow.medium,
            }}>
            <Text variant="small" style={{ color: colors.text }}>
              {message.text}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}
