import { mockRespond } from '@/api/mock/latency';

import type { DonationsApi } from './api';
import { toDonation } from './mappers';

export const donationsApiMock: DonationsApi = {
  createDonation: (draft) =>
    mockRespond(
      toDonation({
        id: `don-${Date.now()}`,
        amountUsd: draft.amountUsd,
        method: draft.method,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }),
      500
    ),
};
