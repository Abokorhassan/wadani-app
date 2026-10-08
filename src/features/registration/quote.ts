// Data-layer to data-layer, so no screen code is pulled in (AGENTS.md).
import { amountInPlanRange, membershipTotal } from '@/features/membership/mappers';
import type { Plan } from '@/features/membership/types';
import { parseMoney } from '@/lib/money';

import { MAX_MONTHS, MIN_MONTHS, monthsOf } from './form';

export interface Quote {
  /** The amount chosen from the plan's range, per month. */
  monthlyUsd: number;
  months: number;
  /** What is charged: the monthly amount for each month. */
  totalUsd: number;
}

/**
 * What a registration costs, or null until it can be worked out.
 *
 * The one place that decides whether the monthly amount is inside the plan's
 * range and the months are inside the API's 1 to 60. The plan step's total, the
 * payment step's total, the button label and the payload all read this, so they
 * cannot disagree about what is valid.
 */
export function quoteFor(
  plan: Plan | undefined,
  amountText: string | undefined,
  monthsText: string | undefined
): Quote | null {
  if (!plan) return null;

  const monthlyUsd = parseMoney(amountText ?? '');
  if (monthlyUsd === null || !amountInPlanRange(plan, monthlyUsd)) return null;

  const months = monthsOf(monthsText ?? '');
  if (months === null || months < MIN_MONTHS || months > MAX_MONTHS) return null;

  return { monthlyUsd, months, totalUsd: membershipTotal(monthlyUsd, months) };
}
