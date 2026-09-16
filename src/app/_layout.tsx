import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { persistOptions, queryClient } from '@/api/query-client';
import { lightTheme, ThemeProvider, ToastProvider } from '@/design-system';
import { useSessionStore } from '@/features/auth/session-store';
import '@/i18n';

void SplashScreen.preventAutoHideAsync();

/**
 * The only place that decides signed-in vs signed-out routing, so no screen
 * has to check for itself (build-plan §3.4).
 */
function useAuthGate() {
  const status = useSessionStore((state) => state.status);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'restoring') return;

    const group = segments[0];
    const inAuthGroup = group === '(auth)';
    const inAppGroup = group === '(app)';

    if (status === 'signed-out' && inAppGroup) {
      router.replace('/welcome');
    } else if (status === 'signed-in' && inAuthGroup) {
      router.replace('/home');
    }
  }, [status, segments, router]);

  return status;
}

export default function RootLayout() {
  const restore = useSessionStore((state) => state.restore);
  const status = useAuthGate();

  useEffect(() => {
    void restore();
  }, [restore]);

  useEffect(() => {
    if (status !== 'restoring') void SplashScreen.hideAsync();
  }, [status]);

  if (status === 'restoring') return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
          <ThemeProvider value={lightTheme}>
            <ToastProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }}>
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
            </ToastProvider>
          </ThemeProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
