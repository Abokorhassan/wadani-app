import { asApiError, isApiError } from '@/api/errors';

import type { PaymentsApi } from './api';
import type { CheckoutOutcome } from './types';

/**
 * Works out how a card checkout ended.
 *
 * With a `sid` (the member came back through the return page), the app confirms
 * the payment itself. Without one (they closed the page), it asks the server
 * where the checkout stands, because a member can pay and then close before the
 * redirect: that is "completed", not "cancelled".
 *
 * Kept free of UI so the money decisions can be tested on their own.
 */
export async function settleCheckout(
  api: Pick<PaymentsApi, 'confirmCard' | 'getCheckoutStatus'>,
  checkoutId: string,
  sid?: string
): Promise<CheckoutOutcome> {
  if (sid) {
    try {
      return { status: 'completed', result: await api.confirmCard(checkoutId, sid) };
    } catch (error) {
      const details = isApiError(error) ? asApiError(error) : null;
      // 422: Sifalo says the payment did not complete. 400 (a bad payload)
      // cannot be retried into success either, so both end the same way.
      if (details?.kind === 'declined' || details?.kind === 'validation') {
        return { status: 'failed', reason: 'declined' };
      }
      // 409: in progress elsewhere, already used, or can no longer be finished.
      // The server's own status tells those apart.
      if (details?.kind === 'server' && details.status === 409) {
        return (await statusOf(api, checkoutId)) === 'COMPLETED'
          ? { status: 'completed' }
          : { status: 'failed', reason: 'conflict' };
      }
      // A dropped connection may have happened after the server finished.
      return (await statusOf(api, checkoutId)) === 'COMPLETED'
        ? { status: 'completed' }
        : { status: 'failed', reason: 'error' };
    }
  }

  const status = await statusOf(api, checkoutId);
  if (status === 'COMPLETED') return { status: 'completed' };
  // Paid, but the server could not finish the work: the office has to sort it out.
  if (status === 'FAILED_AFTER_PAYMENT') return { status: 'failed', reason: 'conflict' };
  return { status: 'cancelled' };
}

async function statusOf(
  api: Pick<PaymentsApi, 'getCheckoutStatus'>,
  checkoutId: string
): Promise<string> {
  try {
    return await api.getCheckoutStatus(checkoutId);
  } catch {
    return 'UNKNOWN';
  }
}
