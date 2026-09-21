import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';
import { toAmountString } from '@/features/membership/mappers';

import { toPayment } from './mappers';
import { cardReturnUrl } from './return-url';
import { cardCheckoutResponse, paymentsResponse } from './schemas';
import type { CardCheckout, ChargeRequest, Payment } from './types';

/** The body every Sifalo charge shares (register, renew, donate). */
export function chargeBody(charge: ChargeRequest): Record<string, unknown> {
  return {
    amount: toAmountString(charge.amountUsd),
    method: charge.method,
    // A wallet is charged directly; a card goes out to Sifalo and back here.
    ...(charge.method === 'CARD'
      ? { returnUrl: cardReturnUrl() }
      : charge.payerPhone
        ? { payerPhone: charge.payerPhone }
        : {}),
  };
}

export const paymentsApi = {
  async getPayments(): Promise<Payment[]> {
    const data = await request('/mobile/members/me/payments');
    return parseResponse(paymentsResponse, data, 'GET /mobile/members/me/payments').payments.map(
      toPayment
    );
  },

  /** Renews the caller's own membership; 409 while the current period runs. */
  async renew(charge: ChargeRequest): Promise<unknown> {
    return request('/mobile/members/me/renew', { method: 'POST', body: chargeBody(charge) });
  },

  /** Finishes a card payment once Sifalo sends the member back with a `sid`. */
  async confirmCard(checkoutId: string, sid: string): Promise<unknown> {
    return request('/mobile/payments/card/confirm', {
      method: 'POST',
      body: { checkoutId, sid },
      authenticated: false,
    });
  },
};

/** Recognises the `202` body that every card flow returns in place of a result. */
export function asCardCheckout(data: unknown): CardCheckout | null {
  const parsed = cardCheckoutResponse.safeParse(data);
  return parsed.success ? parsed.data : null;
}

export type PaymentsApi = typeof paymentsApi;
