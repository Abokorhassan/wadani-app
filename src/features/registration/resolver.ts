import { zodResolver } from '@hookform/resolvers/zod';
import { t } from 'i18next';
import type { FieldErrors, Resolver } from 'react-hook-form';

// Data-layer to data-layer, so no screen code is pulled in (AGENTS.md).
import { getCachedPlan } from '@/features/membership/hooks';
import { amountProblem } from '@/features/membership/mappers';
import { formatUsd } from '@/lib/format';
import { parseMoney } from '@/lib/money';

import { registrationSchema, walletPhoneMessage, type RegistrationForm } from './form';

/**
 * The schema, plus the checks that cannot live in it.
 *
 * Two things are evaluated here instead of in the schema, on every validation:
 *
 * - **The amount against the chosen plan.** It depends on data loaded from the
 *   server, and the backend checks nothing (api-contract/, POST
 *   /mobile/auth/register `amount`). An error set by hand would be wiped by the
 *   next blur, because the schema does not know about the plan.
 * - **The wallet number.** An object-level check in zod is skipped whenever any
 *   field is invalid, so a member who had also missed the terms box would never
 *   be told about the wallet until they had fixed everything else.
 */
export const registrationResolver: Resolver<RegistrationForm> = async (
  values,
  context,
  options
) => {
  const base = await zodResolver(registrationSchema)(values, context, options);
  const extra: FieldErrors<RegistrationForm> = {};

  const wallet = walletPhoneMessage(values);
  if (wallet) extra.payerPhone = { type: 'custom', message: wallet };

  const plan = values.planId ? getCachedPlan(values.planId) : undefined;
  const amountUsd = parseMoney(values.amount ?? '');
  const problem = plan && amountUsd !== null ? amountProblem(plan, amountUsd) : null;
  if (plan && problem === 'tooLow') {
    extra.amount = {
      type: 'custom',
      message: t('register.amountTooLow', { min: formatUsd(plan.priceUsd) }),
    };
  } else if (plan && problem === 'tooHigh') {
    extra.amount = {
      type: 'custom',
      message: t('register.amountTooHigh', { max: formatUsd(plan.priceMaxUsd ?? 0) }),
    };
  }

  if (Object.keys(extra).length === 0) return base;

  return {
    values: {},
    errors: { ...('errors' in base ? base.errors : {}), ...extra },
  } as Awaited<ReturnType<Resolver<RegistrationForm>>>;
};
