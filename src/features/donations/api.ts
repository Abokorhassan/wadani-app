import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';
import { asCardCheckout, chargeBody } from '@/features/payments/api';

import { toDonation } from './mappers';
import { donationResponse, donationsResponse } from './schemas';
import type { Donation, DonationDraft, DonationResult } from './types';

export const donationsApi = {
  async createDonation(draft: DonationDraft): Promise<DonationResult> {
    const data = await request('/mobile/members/me/donations', {
      method: 'POST',
      body: chargeBody({
        method: draft.method,
        amountUsd: draft.amountUsd,
        payerPhone: draft.payerPhone,
      }),
    });

    const checkout = asCardCheckout(data);
    if (checkout) return { kind: 'checkout', checkout };

    const parsed = parseResponse(donationResponse, data, 'POST /mobile/members/me/donations');
    return { kind: 'donated', donation: toDonation(parsed.donation) };
  },

  async getDonations(): Promise<Donation[]> {
    const data = await request('/mobile/members/me/donations');
    return parseResponse(donationsResponse, data, 'GET /mobile/members/me/donations').donations.map(
      toDonation
    );
  },
};

export type DonationsApi = typeof donationsApi;
