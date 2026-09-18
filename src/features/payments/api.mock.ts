import { mockRespond } from '@/api/mock/latency';

import type { PaymentsApi } from './api';
import { toPayment } from './mappers';
import type { PaymentDto } from './schemas';

/** Sample payments from the prototype. */
export const paymentFixtures: PaymentDto[] = [
  {
    id: 'pay-2',
    method: 'zaad',
    amountUsd: 25,
    reference: 'TX-102938',
    date: '2026-09-12T00:00:00.000Z',
    status: 'completed',
  },
  {
    id: 'pay-1',
    method: 'cash',
    amountUsd: 25,
    reference: 'TX-098211',
    date: '2025-09-12T00:00:00.000Z',
    status: 'completed',
  },
];

export const paymentsApiMock: PaymentsApi = {
  getPayments: () => mockRespond(paymentFixtures.map(toPayment)),
};
