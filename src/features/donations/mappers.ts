import { toUsd } from '@/features/membership/mappers';
import { parseMoney } from '@/lib/money';

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

/**
 * Reads the amount typed on the donate screen: "25", "25.5" or "$25", at most two
 * decimals. Null when it is not a usable amount (src/lib/money.ts explains why
 * this is strict).
 */
export function parseAmount(input: string): number | null {
  return parseMoney(input);
}
