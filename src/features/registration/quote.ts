import { t } from 'i18next';

// Data-layer to data-layer, so no screen code is pulled in (AGENTS.md).
import { amountInPlanRange, membershipTotal } from '@/features/membership/mappers';
import type { Plan } from '@/features/membership/types';
import { formatUsd } from '@/lib/format';
import { parseMoney } from '@/lib/money';

import { MAX_MONTHS, MIN_MONTHS, monthsOf } from './form';

export interface Quote {
  /**
   * The amount chosen from the plan's range: per month, or for the whole
   * period on a fixed-length plan.
   */
  priceUsd: number;
  months: number;
  /** A fixed-length plan: the plan set the months, and the price is paid once. */
  fixedLength: boolean;
  /** What is charged. */
  totalUsd: number;
}

/**
 * What a registration costs, or null until it can be worked out.
 *
 * The one place that decides whether the amount is inside the plan's range and
 * the months are inside the API's 1 to 60. The plan step's total, the payment
 * step's total, the button label and the payload all read this, so they cannot
 * disagree about what is valid.
 *
 * The same rule as the backend's membershipCharge: a plan where the member
 * chooses the months charges the price for each month; a fixed-length plan
 * charges its price once, for its own months, whatever was typed.
 */
export function quoteFor(
  plan: Plan | undefined,
  amountText: string | undefined,
  monthsText: string | undefined
): Quote | null {
  if (!plan) return null;

  const priceUsd = parseMoney(amountText ?? '');
  if (priceUsd === null || !amountInPlanRange(plan, priceUsd)) return null;

  if (plan.fixedMonths) {
    return { priceUsd, months: plan.fixedMonths, fixedLength: true, totalUsd: priceUsd };
  }

  const months = monthsOf(monthsText ?? '');
  if (months === null || months < MIN_MONTHS || months > MAX_MONTHS) return null;

  return {
    priceUsd,
    months,
    fixedLength: false,
    totalUsd: membershipTotal(priceUsd, months),
  };
}

/** How the total was reached, under the total: "$15.00 × 12 months", or "For 12 months". */
export function describeQuote(quote: Quote): string {
  const months = t('register.monthsUnit', { count: quote.months });
  return quote.fixedLength
    ? t('register.totalFixed', { months })
    : t('register.totalFormula', { price: formatUsd(quote.priceUsd), months });
}
