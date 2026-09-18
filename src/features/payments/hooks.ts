import { useQuery } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';

import { paymentsApi } from './api';
import { paymentsApiMock } from './api.mock';

const api = pickApi('payments', paymentsApi, paymentsApiMock);

export const paymentsKeys = {
  history: ['payments'] as const,
};

export function usePayments() {
  return useQuery({
    queryKey: paymentsKeys.history,
    queryFn: () => api.getPayments(),
  });
}
