import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldErrors, Resolver } from 'react-hook-form';

import { registrationSchema, walletPhoneMessage, type RegistrationForm } from './form';

/**
 * The schema, plus the wallet-number check evaluated on every validation.
 *
 * An object-level check in zod is skipped whenever any field is invalid, so a
 * member who had also missed the terms box would never be told about the
 * wallet until they had fixed everything else.
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

  if (Object.keys(extra).length === 0) return base;

  return {
    values: {},
    errors: { ...('errors' in base ? base.errors : {}), ...extra },
  } as Awaited<ReturnType<Resolver<RegistrationForm>>>;
};
