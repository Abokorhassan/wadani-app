import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';
import { toAmountString } from '@/features/membership/mappers';
import { toInternationalPhone } from '@/lib/phone';

import { cardReturnUrl } from './card-return';
import { toPayment } from './mappers';
import {
  cardCheckoutResponse,
  checkoutStatusResponse,
  confirmResponse,
  paymentsResponse,
} from './schemas';
import type { CardCheckout, ChargeRequest, CheckoutStatus, Payment } from './types';

/** The body every Sifalo charge shares (register, renew, donate). */
export function chargeBody(charge: ChargeRequest): Record<string, unknown> {
  return {
    amount: toAmountString(charge.amountUsd),
    method: charge.method,
    // A wallet is charged directly; a card goes out to Sifalo and back here.
    ...(charge.method === 'CARD'
      ? { returnUrl: cardReturnUrl() }
      : charge.payerPhone
        ? // The phone field's "+252" is only a label, so "63 234 5678" arrives as typed.
          { payerPhone: toInternationalPhone(charge.payerPhone) ?? charge.payerPhone }
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

  /**
   * Finishes a card payment once Sifalo sends the member back with a `sid`.
   * Safe to repeat: a completed checkout returns its stored result.
   */
  async confirmCard(checkoutId: string, sid: string): Promise<Record<string, unknown>> {
    const data = await request('/mobile/payments/card/confirm', {
      method: 'POST',
      body: { checkoutId, sid },
      authenticated: false,
    });
    return parseResponse(confirmResponse, data, 'POST /mobile/payments/card/confirm');
  },

  /** Where a checkout stands, for when the member left without coming back. */
  async getCheckoutStatus(checkoutId: string): Promise<CheckoutStatus> {
    const data = await request(
      `/mobile/payments/card/checkouts/${encodeURIComponent(checkoutId)}`,
      {
        authenticated: false,
      }
    );
    const status = parseResponse(
      checkoutStatusResponse,
      data,
      'GET /mobile/payments/card/checkouts/{id}'
    ).checkout.status.toUpperCase();
    const known: CheckoutStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED_AFTER_PAYMENT'];
    return known.includes(status as CheckoutStatus) ? (status as CheckoutStatus) : 'UNKNOWN';
  },
};

/** Recognises the `202` body that every card flow returns in place of a result. */
export function asCardCheckout(data: unknown): CardCheckout | null {
  const parsed = cardCheckoutResponse.safeParse(data);
  return parsed.success ? parsed.data : null;
}

export type PaymentsApi = typeof paymentsApi;
