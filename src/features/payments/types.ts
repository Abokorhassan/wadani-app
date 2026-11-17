/**
 * Every charge the app makes goes through Sifalo Pay, so these four are the
 * only methods a member can pick (party decision, 2026-09-19).
 */
export type ChargeMethod = 'WAAFI' | 'EDAHAB' | 'PREMIER_WALLET' | 'CARD';

/**
 * History can also hold methods recorded by staff in the back office, and the
 * $0 FREE entry a free plan records in place of a charge.
 */
export type PaymentMethod =
  ChargeMethod | 'FREE' | 'ONLINE' | 'CASH' | 'ZAAD' | 'DARASALAAM' | 'DAHABSHIIL' | 'PREMIER_BANK';

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

/** The server's view of a card checkout (GET /mobile/payments/card/checkouts/{id}). */
export type CheckoutStatus =
  'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED_AFTER_PAYMENT' | 'UNKNOWN';

/**
 * How a card checkout ended, as far as the member is concerned.
 *
 * - `completed`: the backend has the money and has done the work. `result` is
 *   the confirm response (member and card, or donation) when the app confirmed it.
 * - `cancelled`: the member left before paying, as far as the server knows.
 * - `failed`: `declined` means Sifalo refused the charge; `conflict` means money
 *   may have been taken but the work could not be finished (e.g. the phone was
 *   registered meanwhile), which needs the office; `error` is anything else.
 */
export type CheckoutOutcome =
  | { status: 'completed'; result?: Record<string, unknown> }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: 'declined' | 'conflict' | 'error' };
