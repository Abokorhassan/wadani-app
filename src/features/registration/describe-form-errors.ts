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
    const message = (error as { message?: string } | undefined)?.message;
    if (!message) continue;
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
