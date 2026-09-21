import { z } from 'zod';

/** Backend shapes, from api-contract/waddani-mobile-api.openapi.json. */
export const paymentDto = z.object({
  id: z.string(),
  memberId: z.string().nullish(),
  // Left open: an unknown method is labelled rather than failing the list.
  method: z.string(),
  status: z.string(),
  amount: z.string(),
  currency: z.string().nullish(),
  reference: z.string().nullish(),
  accountPaid: z.string().nullish(),
  paidAt: z.string().nullish(),
});

export const paymentsResponse = z.object({ payments: z.array(paymentDto) });

/** `202` from a CARD charge, shared by register, renew and donate. */
export const cardCheckoutResponse = z.object({
  checkoutId: z.string(),
  checkoutUrl: z.string(),
});

export type PaymentDto = z.infer<typeof paymentDto>;
