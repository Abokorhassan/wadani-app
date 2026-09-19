import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';

import { toDonation } from './mappers';
import { donationDto } from './schemas';
import type { Donation, DonationDraft } from './types';

/** Live endpoints. Paths are placeholders until the Postman collection lands. */
export const donationsApi = {
  async createDonation(draft: DonationDraft): Promise<Donation> {
    const data = await request('/donations', { method: 'POST', body: draft });
    return toDonation(parseResponse(donationDto, data, 'POST /donations'));
  },
};

export type DonationsApi = typeof donationsApi;
