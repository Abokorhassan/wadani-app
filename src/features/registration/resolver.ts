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
