import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';
import { asCardCheckout, chargeBody } from '@/features/payments/api';
import { toInternationalPhone } from '@/lib/phone';

import { toDonation } from './mappers';
import { donationResponse, donationsResponse } from './schemas';
import type { Donation, DonationDraft, DonationResult, GuestDonationDraft } from './types';

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

  /** No account or token: the donor's name and phone travel with the payment. */
  async createGuestDonation(draft: GuestDonationDraft): Promise<DonationResult> {
    const data = await request('/mobile/donations', {
      method: 'POST',
      authenticated: false,
      body: {
        fullName: draft.fullName,
        phone: toInternationalPhone(draft.phone) ?? draft.phone,
        ...chargeBody({
          method: draft.method,
          amountUsd: draft.amountUsd,
          payerPhone: draft.payerPhone,
        }),
      },
    });

    const checkout = asCardCheckout(data);
    if (checkout) return { kind: 'checkout', checkout };

    const parsed = parseResponse(donationResponse, data, 'POST /mobile/donations');
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
