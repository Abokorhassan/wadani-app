import type { DonationDto } from './schemas';
import type { Donation } from './types';

export function toDonation(dto: DonationDto): Donation {
  const status = dto.status.toLowerCase();
  return {
    id: dto.id,
    amountUsd: dto.amountUsd,
    method: dto.method,
    status: status === 'completed' || status === 'failed' ? status : 'pending',
    createdAt: dto.createdAt,
  };
}

/** Accepts "25", "25.5", "$25" — returns null when it isn't a usable amount. */
export function parseAmount(input: string): number | null {
  const amount = Number(input.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100) / 100;
}
