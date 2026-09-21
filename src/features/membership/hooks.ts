import { useQuery } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';
import { useSessionStore } from '@/features/auth/session-store';

import { membershipApi } from './api';
import { membershipApiMock } from './api.mock';

const api = pickApi('membership', membershipApi, membershipApiMock);

export const membershipKeys = {
  plans: ['plans'] as const,
  periods: ['periods'] as const,
  /** Persisted to disk so the card opens offline (see src/api/query-client.ts). */
  card: ['card'] as const,
};

export function usePlans() {
  return useQuery({
    queryKey: membershipKeys.plans,
    queryFn: () => api.getPlans(),
  });
}

export function usePeriods() {
  return useQuery({
    queryKey: membershipKeys.periods,
    queryFn: () => api.getPeriods(),
  });
}

/**
 * The signed-in member's own record.
 *
 * There is no profile endpoint: the backend returns the full member only from
 * registration, so this is whatever the session saved then. A member who signs
 * in on another device has none, and screens fall back to the card
 * (docs/api-gaps.md, question 5).
 */
export function useMe() {
  return useSessionStore((state) => state.member);
}

export function useCard() {
  const signedIn = useSessionStore((state) => state.status === 'signed-in');
  return useQuery({
    queryKey: membershipKeys.card,
    queryFn: () => api.getCard(),
    enabled: signedIn,
  });
}
