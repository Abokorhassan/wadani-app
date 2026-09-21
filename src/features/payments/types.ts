/**
 * Every charge the app makes goes through Sifalo Pay, so these four are the
 * only methods a member can pick (party decision, 2026-09-19).
 */
export type ChargeMethod = 'WAAFI' | 'EDAHAB' | 'PREMIER_WALLET' | 'CARD';

/** History can also hold methods recorded by staff in the back office. */
export type PaymentMethod =
  | ChargeMethod
  | 'ONLINE'
  | 'CASH'
  | 'ZAAD'
  | 'DARASALAAM'
  | 'DAHABSHIIL'
  | 'PREMIER_BANK';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'unknown';

export interface Payment {
  id: string;
  method: PaymentMethod;
  amountUsd: number;
  currency: string;
  /** Sifalo Pay transaction id. */
  reference?: string;
  /** The wallet or card that was charged. */
  accountPaid?: string;
  /** ISO date. */
  date: string;
  status: PaymentStatus;
}

/** A wallet charge takes the payer's phone; a card charge opens a checkout page. */
export interface ChargeRequest {
  method: ChargeMethod;
  amountUsd: number;
  payerPhone?: string;
}

/** `202` from any Sifalo card flow: send the member to `checkoutUrl`. */
export interface CardCheckout {
  checkoutId: string;
  checkoutUrl: string;
}
