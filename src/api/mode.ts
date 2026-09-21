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

/**
 * Features the backend has no endpoints for at all (docs/api-gaps.md §2).
 * They stay on their stand-in data whatever the setting says, because going
 * live for them means 404s: `support` alone backs the Contact screen, the
 * pending screen's contact button and the "Forgot password?" fallback on
 * Login. Take a feature out of this list when its endpoints land.
 */
const WITHOUT_BACKEND: ReadonlySet<FeatureKey> = new Set([
  'family',
  'notifications',
  'support',
]);

export function isMocked(feature: FeatureKey): boolean {
  return WITHOUT_BACKEND.has(feature) || mockedFeatures.has(feature);
}

/** Features that would go live if the setting allowed it. Used by the phase check. */
export const FEATURES_WITHOUT_BACKEND = WITHOUT_BACKEND;

/** Picks the mock or live implementation of a feature's API module. */
export function pickApi<T>(feature: FeatureKey, live: T, mock: T): T {
  return isMocked(feature) ? mock : live;
}
