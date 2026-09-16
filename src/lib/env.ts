import Constants from 'expo-constants';

/**
 * Public runtime config. Everything here comes from EXPO_PUBLIC_* variables,
 * which are inlined at build time, so never put secrets in them.
 */
export const env = {
  /** Base URL of the backend, e.g. https://staging.api.waddani.so */
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  /** 'all' | 'none' | comma-separated feature keys. See src/api/mode.ts */
  apiMock: process.env.EXPO_PUBLIC_API_MOCK ?? 'all',
  /** Delay added to mock responses, so loading states are visible. */
  mockLatencyMs: Number(process.env.EXPO_PUBLIC_MOCK_LATENCY_MS ?? 450),
  appVersion: Constants.expoConfig?.version ?? '0.0.0',
  isDev: __DEV__,
} as const;
