import type { PaymentMethodId } from '@/features/payments';

export interface DonationDraft {
  amountUsd: number;
  method: PaymentMethodId;
}

export interface Donation {
  id: string;
  amountUsd: number;
  method: PaymentMethodId;
  /** Manual donations start as pending until the office confirms them (build-plan D25). */
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

/** Quick-pick amounts from the prototype. */
export const DONATION_PRESETS = [5, 10, 25, 50];
