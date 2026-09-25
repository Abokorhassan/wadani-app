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

/** GET /mobile/payments/card/checkouts/{id}: nothing identifying, just the state. */
export const checkoutStatusResponse = z.object({
  checkout: z.looseObject({ id: z.string().nullish(), status: z.string() }),
});

/** Kept loose: its shape depends on `purpose` (REGISTER, RENEW or DONATE). */
export const confirmResponse = z.looseObject({ purpose: z.string().nullish() });
