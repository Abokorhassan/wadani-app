import type { FieldErrors } from 'react-hook-form';

import { stepForField } from './form';
import type { RegistrationForm } from './form';

/** Step names, in step order, for telling the member where a field lives. */
export const STEP_NAME_KEYS = [
  'register.steps.personal',
  'register.steps.address',
  'register.steps.plan',
  'register.steps.payment',
] as const;

/**
 * A human-readable label for a field, used when its own validation error has
 * no message (some zod/resolver combinations produce a bare error). Without
 * this the whole error would collapse to the generic "fix the highlighted
 * fields" text, hiding which field is actually at fault.
 */
const FIELD_LABELS: Partial<Record<keyof RegistrationForm, string>> = {
  fullName: 'Full name',
  gender: 'Gender',
  phone: 'Phone number',
  whatsapp: 'WhatsApp number',
  email: 'Email',
  birthYear: 'Year of birth',
  education: 'Educational level',
  professionalWork: 'Work or profession',
  password: 'Password',
  photoUri: 'Photo',
  line1: 'Street or neighbourhood',
  city: 'City',
  region: 'Region',
  country: 'Country',
  district: 'District',
  planId: 'Membership plan',
  periodId: 'Membership period',
  method: 'Payment method',
  amount: 'Amount',
  payerPhone: 'Wallet number',
  acceptedTerms: 'Terms and conditions',
};

/**
 * Every field the form is currently unhappy with, as the member would read
 * it: each message on its own line, grouped under the step it belongs to
 * when that is not the step they are looking at. Used instead of showing
 * only the first error, which hid the rest of what needed fixing.
 */
export function describeFormErrors(
  errors: FieldErrors<RegistrationForm>,
  currentStep: number,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const byStep = new Map<number, string[]>();
  for (const [field, error] of Object.entries(errors)) {
    // Fall back to a plain "<Field> needs attention" so a message-less error
    // still points at its field instead of vanishing into the generic text.
    const label = FIELD_LABELS[field as keyof RegistrationForm] ?? field;
    const message =
      (error as { message?: string } | undefined)?.message || `${label} needs attention.`;
    const stepIndex = stepForField(field);
    byStep.set(stepIndex, [...(byStep.get(stepIndex) ?? []), message]);
  }

  if (byStep.size === 0) return t('register.fixErrors');

  const lines: string[] = [];
  // The current step's own problems come first, since that is what is on screen.
  const order = [currentStep, ...[...byStep.keys()].filter((index) => index !== currentStep)];
  for (const stepIndex of order) {
    const messages = byStep.get(stepIndex);
    if (!messages) continue;
    if (stepIndex !== currentStep) {
      lines.push(`${t(STEP_NAME_KEYS[stepIndex])}:`);
    }
    for (const message of messages)
      lines.push(stepIndex === currentStep ? message : `• ${message}`);
  }
  return lines.join('\n');
}
