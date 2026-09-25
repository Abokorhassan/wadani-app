import { useMutation, useQueryClient } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';
// Data-layer to data-layer, so no screen code is pulled in (AGENTS.md).
import { paymentsKeys } from '@/features/payments/hooks';

import { donationsApi } from './api';
import { donationsApiMock } from './api.mock';
import type { DonationDraft } from './types';

const api = pickApi('donations', donationsApi, donationsApiMock);

export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: DonationDraft) => api.createDonation(draft),
    // A donation is a payment too, so the history reloads.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentsKeys.history }),
  });
}
