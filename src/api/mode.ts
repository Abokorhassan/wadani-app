import { env } from '@/lib/env';

/**
 * Features can run on mock data or the live backend independently, so we can go
 * live one endpoint group at a time as the backend delivers them.
 *
 * EXPO_PUBLIC_API_MOCK = 'all' | 'none' | 'auth,membership,family'
 */
export const FEATURES = [
  'auth',
  'membership',
  'payments',
  'donations',
  'newsEvents',
  'family',
  'support',
  'notifications',
] as const;

export type FeatureKey = (typeof FEATURES)[number];

const setting = env.apiMock.trim();

const mockedFeatures: ReadonlySet<string> =
  setting === 'all'
    ? new Set(FEATURES)
    : setting === 'none' || setting === ''
      ? new Set()
      : new Set(
          setting
            .split(',')
            .map((part: string) => part.trim())
            .filter(Boolean)
        );

export function isMocked(feature: FeatureKey): boolean {
  return mockedFeatures.has(feature);
}

/** Picks the mock or live implementation of a feature's API module. */
export function pickApi<T>(feature: FeatureKey, live: T, mock: T): T {
  return isMocked(feature) ? mock : live;
}
