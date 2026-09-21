import type { CardCheckout, ChargeMethod } from '@/features/payments/types';

export interface DonationDraft {
  amountUsd: number;
  method: ChargeMethod;
  /** The wallet to charge; not used for CARD. */
  payerPhone?: string;
}

export interface Donation {
  id: string;
  amountUsd: number;
  currency: string;
  method: ChargeMethod;
  reference?: string;
  accountPaid?: string;
  donatedAt: string;
}

/** A card donation opens a Sifalo checkout before anything is recorded. */
export type DonationResult =
  | { kind: 'donated'; donation: Donation }
  | { kind: 'checkout'; checkout: CardCheckout };

/** Quick-pick amounts from the prototype. */
export const DONATION_PRESETS = [5, 10, 25, 50];
