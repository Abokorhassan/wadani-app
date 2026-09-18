import { z } from 'zod';

/** Backend shapes; rewritten from the Postman collection when it lands (build-plan §4.6). */
export const paymentDto = z.object({
  id: z.string(),
  method: z.enum(['cash', 'zaad', 'edahab', 'dahabshiil', 'premier_bank']),
  amountUsd: z.number(),
  reference: z.string(),
  date: z.string(),
  // Kept open: an unexpected status shows as "unknown" rather than failing the list.
  status: z.string(),
});

export const paymentsResponse = z.array(paymentDto);

export type PaymentDto = z.infer<typeof paymentDto>;
