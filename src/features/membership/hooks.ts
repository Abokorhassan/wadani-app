import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';
import { queryClient } from '@/api/query-client';
import { useSessionStore } from '@/features/auth/session-store';

import { membershipApi } from './api';
import { membershipApiMock } from './api.mock';
import { badgeForPlanName, isOnFreePlan } from './mappers';
import type { Plan } from './types';

const api = pickApi('membership', membershipApi, membershipApiMock);

export const membershipKeys = {
  plans: ['plans'] as const,
  periods: ['periods'] as const,
  me: ['me'] as const,
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
 * The signed-in member's own record. Fetched live from `GET /mobile/auth/me` so
 * a member sees their full profile on any device -- the session-stored record
 * (saved at registration) is the offline fallback and is refreshed here.
 */
export function useMe() {
  const signedIn = useSessionStore((state) => state.status === 'signed-in');
  const stored = useSessionStore((state) => state.member);
  const setMember = useSessionStore((state) => state.setMember);

  const query = useQuery({
    queryKey: membershipKeys.me,
    queryFn: () => api.getMe(),
    enabled: signedIn,
    initialData: stored ?? undefined,
  });

  useEffect(() => {
    if (query.data && JSON.stringify(query.data) !== JSON.stringify(stored)) {
      setMember(query.data);
    }
  }, [query.data, stored, setMember]);

  return query.data ?? stored;
}

export function useCard() {
  const signedIn = useSessionStore((state) => state.status === 'signed-in');
  return useQuery({
    queryKey: membershipKeys.card,
    queryFn: () => api.getCard(),
    enabled: signedIn,
  });
}

/** The plan badge for a card, or undefined while plans load or when none matches. */
export function usePlanBadge(planName: string | undefined): string | undefined {
  const plans = usePlans();
  return badgeForPlanName(plans.data ?? [], planName);
}

/** Whether the signed-in member is on a free plan, whose card carries no badge. */
export function useOnFreePlan(planName: string | undefined): boolean {
  const me = useMe();
  const plans = usePlans();
  return isOnFreePlan(plans.data ?? [], me?.membershipTypeId, planName);
}

/**
 * A plan already loaded into the cache, for code that cannot use a hook, such as
 * a form resolver that runs on every validation.
 */
export function getCachedPlan(planId: string): Plan | undefined {
  return queryClient.getQueryData<Plan[]>(membershipKeys.plans)?.find((plan) => plan.id === planId);
}
