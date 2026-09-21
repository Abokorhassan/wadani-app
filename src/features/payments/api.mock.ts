import { mockRespond } from '@/api/mock/latency';

import type { PaymentsApi } from './api';
import { toPayment } from './mappers';
import type { PaymentDto } from './schemas';

/** Sample payments, in the live payload shape. */
export const paymentFixtures: PaymentDto[] = [
  {
    id: 'aaaa1111-0000-0000-0000-000000000002',
    memberId: '6f1c0f8e-6d6a-4d1a-9f0e-2c7a1b3d4e5f',
    method: 'WAAFI',
    status: 'COMPLETED',
    amount: '25.00',
    currency: 'USD',
    reference: 'TX-102938',
    accountPaid: '+252632345678',
    paidAt: '2026-09-12T00:00:00.000Z',
  },
  {
    id: 'aaaa1111-0000-0000-0000-000000000001',
    memberId: '6f1c0f8e-6d6a-4d1a-9f0e-2c7a1b3d4e5f',
    method: 'EDAHAB',
    status: 'COMPLETED',
    amount: '25.00',
    currency: 'USD',
    reference: 'TX-098211',
    accountPaid: '+252652345678',
    paidAt: '2025-09-12T00:00:00.000Z',
  },
];

export const paymentsApiMock: PaymentsApi = {
  getPayments: () => mockRespond(paymentFixtures.map(toPayment)),
  renew: () => mockRespond({ payment: paymentFixtures[0] }, 800),
  confirmCard: () => mockRespond({ purpose: 'REGISTER' }, 800),
};
