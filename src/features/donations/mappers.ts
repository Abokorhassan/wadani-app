import { toUsd } from '@/features/membership/mappers';

import type { DonationDto } from './schemas';
import type { Donation } from './types';

export function toDonation(dto: DonationDto): Donation {
  return {
    id: dto.id,
    amountUsd: toUsd(dto.amount),
    currency: dto.currency ?? 'USD',
    method: dto.method,
    reference: dto.reference ?? undefined,
    accountPaid: dto.accountPaid ?? undefined,
    donatedAt: dto.donatedAt ?? new Date().toISOString(),
  };
}

/** Accepts "25", "25.5", "$25" — returns null when it isn't a usable amount. */
export function parseAmount(input: string): number | null {
  const amount = Number(input.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100) / 100;
}
