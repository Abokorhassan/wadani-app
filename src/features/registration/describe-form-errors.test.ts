import type { FieldErrors } from 'react-hook-form';

import { describeFormErrors } from './describe-form-errors';
import type { RegistrationForm } from './form';

const t = (key: string) => key.split('.').pop() as string;

describe('describeFormErrors', () => {
  it('lists every failing field, not just the first one found', () => {
    // The actual bug: only the first entry in formState.errors was shown, so
    // fixing it and resubmitting just meant hitting the next one, one at a time.
    const errors = {
      password: { message: 'Password must be at least 8 characters.' },
      fullName: { message: 'Please enter your full name.' },
    } as FieldErrors<RegistrationForm>;

    const text = describeFormErrors(errors, 0, t);
    expect(text).toContain('Password must be at least 8 characters.');
    expect(text).toContain('Please enter your full name.');
  });

  it("puts the current step's own errors first, plainly", () => {
    const errors = {
      amount: { message: 'Please enter an amount.' },
      fullName: { message: 'Please enter your full name.' },
    } as FieldErrors<RegistrationForm>;

    // amount lives on the payment step (3); fullName on personal (0).
    const text = describeFormErrors(errors, 3, t);
    expect(text.split('\n')[0]).toBe('Please enter an amount.');
  });

  it('labels an error that lives on a different step, so it is not lost', () => {
    const errors = {
      fullName: { message: 'Please enter your full name.' },
    } as FieldErrors<RegistrationForm>;

    // Looking at the payment step (3), but the bad field is on personal (0).
    const text = describeFormErrors(errors, 3, t);
    expect(text).toContain('personal');
    expect(text).toContain('Please enter your full name.');
  });

  it('falls back to a generic message only when nothing has one', () => {
    expect(describeFormErrors({}, 0, t)).toBe('fixErrors');
  });
});
