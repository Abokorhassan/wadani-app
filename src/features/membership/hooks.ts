import { useQuery } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';

import { membershipApi } from './api';
import { membershipApiMock } from './api.mock';

const api = pickApi('membership', membershipApi, membershipApiMock);

export const membershipKeys = {
  plans: ['plans'] as const,
  periods: ['periods'] as const,
  /** Persisted to disk so the card opens offline (see src/api/query-client.ts). */
  me: ['me'] as const,
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

export function useMe() {
  return useQuery({
    queryKey: membershipKeys.me,
    queryFn: () => api.getMe(),
  });
}
