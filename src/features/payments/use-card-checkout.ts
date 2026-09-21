import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

import { pickApi } from '@/api/mode';

import { paymentsApi } from './api';
import { paymentsApiMock } from './api.mock';
import { cardReturnUrl } from './return-url';
import type { CardCheckout } from './types';

const api = pickApi('payments', paymentsApi, paymentsApiMock);

function sidFrom(url: string): string | null {
  const { queryParams } = Linking.parse(url);
  const sid = queryParams?.sid;
  return typeof sid === 'string' ? sid : null;
}

/**
 * Runs the Sifalo hosted-checkout round trip: open the page, wait for the
 * member to come back, then confirm so the backend completes the registration,
 * renewal or donation (api-contract/, POST /mobile/payments/card/confirm).
 */
export function useCardCheckout() {
  return useCallback(async (checkout: CardCheckout): Promise<unknown> => {
    const result = await WebBrowser.openAuthSessionAsync(checkout.checkoutUrl, cardReturnUrl());

    // Dismissing the page is not proof of failure, so the sid decides.
    const sid = result.type === 'success' ? sidFrom(result.url) : null;
    if (!sid) throw new Error('card-checkout-cancelled');

    return api.confirmCard(checkout.checkoutId, sid);
  }, []);
}
