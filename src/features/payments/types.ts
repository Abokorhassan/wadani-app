export type PaymentMethodId = 'cash' | 'zaad' | 'edahab' | 'dahabshiil' | 'premier_bank';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'unknown';

export interface Payment {
  id: string;
  method: PaymentMethodId;
  amountUsd: number;
  reference: string;
  /** ISO date. */
  date: string;
  status: PaymentStatus;
}
