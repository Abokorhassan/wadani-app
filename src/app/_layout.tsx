import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DevApiLogViewer } from '@/api/components/dev-api-log-viewer';
import { persistOptions, queryClient } from '@/api/query-client';
import { ThemeProvider, ToastProvider } from '@/design-system';
import { useSessionStore } from '@/features/auth/session-store';
import { CardCheckoutProvider } from '@/features/payments';
import { useAppTheme } from '@/features/settings';
import '@/i18n';

void SplashScreen.preventAutoHideAsync();

/**
 * The only place that decides signed-in vs signed-out routing, so no screen
 * has to check for itself (build-plan §3.4).
 */
function useAuthGate() {
  const status = useSessionStore((state) => state.status);
  const memberStatus = useSessionStore((state) => state.member?.status);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'restoring') return;

    const group = segments[0];
    const inAuthGroup = group === '(auth)';
    const inAppGroup = group === '(app)';
    // Until the charge settles there is no card, so the app stays closed (D2).
    const awaitingReview = memberStatus === 'registered' || memberStatus === 'paymentPending';

    if (status === 'signed-out' && inAppGroup) {
      router.replace('/welcome');
    } else if (status === 'signed-in' && awaitingReview && !inAuthGroup) {
      router.replace('/pending');
    } else if (status === 'signed-in' && !awaitingReview && inAuthGroup) {
      router.replace('/home');
    }
  }, [status, memberStatus, segments, router]);

  return status;
}

export default function RootLayout() {
  const restore = useSessionStore((state) => state.restore);
  const status = useAuthGate();
  // Light, dark, or the phone's own setting (Profile > Appearance).
  const theme = useAppTheme();
  // Keys must match `fonts` in src/design-system/tokens/typography.ts.
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });
  // A font that fails to load falls back to the system font rather than blocking the app.
  const ready = status !== 'restoring' && (fontsLoaded || Boolean(fontError));

  useEffect(() => {
    void restore();
  }, [restore]);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  // The window behind every screen, so a screen change never flashes white in dark mode.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.color.background);
  }, [theme]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
            <ThemeProvider value={theme}>
              <ToastProvider>
                {/* __DEV__ is false in a release build, so this never renders there. */}
                {__DEV__ ? <DevApiLogViewer /> : null}
                <CardCheckoutProvider>
                  <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: theme.color.background },
                    }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(app)" />
                    <Stack.Screen
                      name="gallery"
                      options={{
                        headerShown: true,
                        presentation: 'modal',
                        title: 'Component gallery',
                      }}
                    />
                  </Stack>
                </CardCheckoutProvider>
              </ToastProvider>
            </ThemeProvider>
          </PersistQueryClientProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
