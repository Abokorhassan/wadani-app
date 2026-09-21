import { toUsd } from '@/features/membership/mappers';

import type { PaymentDto } from './schemas';
import type { Payment, PaymentMethod, PaymentStatus } from './types';

const KNOWN_STATUSES: PaymentStatus[] = ['pending', 'completed', 'failed'];

export function toPayment(dto: PaymentDto): Payment {
  const status = dto.status.toLowerCase() as PaymentStatus;
  return {
    id: dto.id,
    method: dto.method as PaymentMethod,
    amountUsd: toUsd(dto.amount),
    currency: dto.currency ?? 'USD',
    reference: dto.reference ?? undefined,
    accountPaid: dto.accountPaid ?? undefined,
    date: dto.paidAt ?? '',
    status: KNOWN_STATUSES.includes(status) ? status : 'unknown',
  };
}

/** Newest first, grouped by calendar year for the history list. */
export function groupByYear(payments: Payment[]): { year: number; payments: Payment[] }[] {
  const sorted = [...payments].sort((a, b) => b.date.localeCompare(a.date));
  const groups = new Map<number, Payment[]>();
  for (const payment of sorted) {
    const year = new Date(payment.date).getFullYear();
    groups.set(year, [...(groups.get(year) ?? []), payment]);
  }
  return [...groups].map(([year, items]) => ({ year, payments: items }));
}
