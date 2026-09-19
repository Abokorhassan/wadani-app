import { z } from 'zod';

/** Backend shapes; rewritten from the Postman collection when it lands (build-plan §4.6). */
export const donationDto = z.object({
  id: z.string(),
  amountUsd: z.number(),
  method: z.enum(['cash', 'zaad', 'edahab', 'dahabshiil', 'premier_bank']),
  status: z.string(),
  createdAt: z.string(),
});

export type DonationDto = z.infer<typeof donationDto>;
