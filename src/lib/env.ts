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
  /** Link shared by "Invite family & friends"; the store or landing page (build-plan D19). */
  inviteUrl: process.env.EXPO_PUBLIC_INVITE_URL ?? '',
  /**
   * The party's S3 bucket, which the app uploads member photos to directly
   * (decision 2026-09-19). These values are compiled into the shipped app and
   * can be read out of it, so the IAM user behind the key must be limited to
   * `s3:PutObject` on this bucket's `members/` prefix. See src/lib/s3.ts.
   */
  s3: {
    region: process.env.EXPO_PUBLIC_S3_REGION ?? '',
    bucket: process.env.EXPO_PUBLIC_S3_BUCKET ?? '',
    publicUrlBase: process.env.EXPO_PUBLIC_S3_PUBLIC_URL_BASE ?? '',
    accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY ?? '',
  },
  appVersion: Constants.expoConfig?.version ?? '0.0.0',
  isDev: __DEV__,
} as const;
