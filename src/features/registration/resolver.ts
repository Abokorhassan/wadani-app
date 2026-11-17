import { zodResolver } from '@hookform/resolvers/zod';
import { t } from 'i18next';
import type { FieldErrors, Resolver } from 'react-hook-form';

// Data-layer to data-layer, so no screen code is pulled in (AGENTS.md).
import { getCachedPlan } from '@/features/membership/hooks';
import { amountInPlanRange, planRange } from '@/features/membership/mappers';
import { formatUsd } from '@/lib/format';
import { parseMoney } from '@/lib/money';

import { registrationSchema, walletPhoneMessage, type RegistrationForm } from './form';

/**
 * The schema, plus the checks that cannot live in it, evaluated on every
 * validation:
 *
 * - **The monthly amount against the chosen plan's range.** It depends on the
 *   plans loaded from the server, and the backend charges whatever it is sent.
 *   An error set by hand would be wiped by the next blur.
 * - **The wallet number.** An object-level check in zod is skipped whenever any
 *   field is invalid, so a member who had also missed the terms box would never
 *   be told about the wallet until they had fixed everything else.
 * - **A free plan.** Nothing is charged, so the amount, months, method and
 *   wallet are neither shown nor checked (MOBILE_FREE_PLAN.md §2).
 */
export const registrationResolver: Resolver<RegistrationForm> = async (
  values,
  context,
  options
) => {
  const base = await zodResolver(registrationSchema)(values, context, options);
  const plan = values.planId ? getCachedPlan(values.planId) : undefined;
  if (plan?.free) return withoutChargeErrors(base, values);

  const extra: FieldErrors<RegistrationForm> = {};

  const wallet = walletPhoneMessage(values);
  if (wallet) extra.payerPhone = { type: 'custom', message: wallet };

  const amount = parseMoney(values.amount ?? '');
  if (plan && amount !== null && !amountInPlanRange(plan, amount)) {
    const { min, max } = planRange(plan);
    extra.amount = {
      type: 'custom',
      message: t('register.amountOutOfRange', { min: formatUsd(min), max: formatUsd(max) }),
    };
  }

  if (Object.keys(extra).length === 0) return base;

  return {
    values: {},
    errors: { ...('errors' in base ? base.errors : {}), ...extra },
  } as Awaited<ReturnType<Resolver<RegistrationForm>>>;
};

/** The fields that only matter when something is charged. */
const CHARGE_FIELDS = ['amount', 'months', 'method', 'payerPhone'] as const;

type ResolverResult = Awaited<ReturnType<Resolver<RegistrationForm>>>;

function withoutChargeErrors(result: ResolverResult, values: RegistrationForm): ResolverResult {
  if (Object.keys(result.errors).length === 0) return result;
  const errors = { ...result.errors };
  for (const field of CHARGE_FIELDS) delete errors[field];
  if (Object.keys(errors).length > 0) return { values: {}, errors };
  // Only charge fields failed, so the form is valid; zod hands back no values on
  // a failure, so these are the member's own.
  return { values, errors: {} };
}
