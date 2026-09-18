import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';

import { toPayment } from './mappers';
import { paymentsResponse } from './schemas';
import type { Payment } from './types';

/** Live endpoints. Paths are placeholders until the Postman collection lands. */
export const paymentsApi = {
  async getPayments(): Promise<Payment[]> {
    const data = await request('/me/payments');
    return parseResponse(paymentsResponse, data, 'GET /me/payments').map(toPayment);
  },
};

export type PaymentsApi = typeof paymentsApi;
