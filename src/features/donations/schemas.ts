import { z } from 'zod';

/** Backend shapes, from api-contract/waddani-mobile-api.openapi.json. */
export const donationDto = z.object({
  id: z.string(),
  memberId: z.string().nullish(),
  method: z.enum(['WAAFI', 'EDAHAB', 'PREMIER_WALLET', 'CARD']),
  amount: z.string(),
  currency: z.string().nullish(),
  reference: z.string().nullish(),
  accountPaid: z.string().nullish(),
  donatedAt: z.string().nullish(),
});

export const donationResponse = z.object({ donation: donationDto });
export const donationsResponse = z.object({ donations: z.array(donationDto) });

export type DonationDto = z.infer<typeof donationDto>;
