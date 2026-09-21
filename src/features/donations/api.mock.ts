import { mockRespond } from '@/api/mock/latency';

import type { DonationsApi } from './api';
import { toDonation } from './mappers';

export const donationsApiMock: DonationsApi = {
  createDonation: (draft) => {
    if (draft.method === 'CARD') {
      return mockRespond(
        {
          kind: 'checkout' as const,
          checkout: {
            checkoutId: '88888888-8888-8888-8888-888888888888',
            checkoutUrl: 'https://checkout.sifalopay.com/mock-donation',
          },
        },
        500
      );
    }
    return mockRespond(
      {
        kind: 'donated' as const,
        donation: toDonation({
          id: `don-${Date.now()}`,
          amount: draft.amountUsd.toFixed(2),
          currency: 'USD',
          method: draft.method,
          reference: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
          accountPaid: draft.payerPhone ?? null,
          donatedAt: new Date().toISOString(),
        }),
      },
      500
    );
  },

  getDonations: () => mockRespond([]),
};
