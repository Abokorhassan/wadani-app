import { z } from 'zod';

const currentYear = new Date().getFullYear();

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

/**
 * One schema per wizard step; "Next" validates only the current step
 * (build-plan §1.3 S2). The messages are the user-facing copy.
 */
export const personalSchema = z.object({
  fullName: z.string().trim().min(1, 'Please enter your full name.'),
  gender: z.enum(['male', 'female'], { message: 'Please choose an option.' }),
  phone: z.string().trim().min(6, 'Please enter your phone number.'),
  whatsapp: optionalText,
  email: z.string().trim().min(1, 'Please enter your email.').email('Please enter a valid email.'),
  // Optional, but must be a real year when given (build-plan D9).
  birthYear: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{4}$/.test(value), 'Enter a 4-digit year, e.g. 1998.')
    .refine(
      (value) => !value || (Number(value) >= 1900 && Number(value) <= currentYear),
      `Enter a year between 1900 and ${currentYear}.`
    ),
  education: z.enum(['none', 'primary', 'secondary', 'diploma', 'bachelor', 'master', 'phd'], {
    message: 'Please choose your educational level.',
  }),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  photoUri: z.string().optional(),
});

export const addressSchema = z.object({
  country: z.string().trim().min(1, 'Please enter your country.'),
  city: z.string().trim().min(1, 'Please enter your city.'),
  line: optionalText,
});

export const planSchema = z.object({
  planId: z.string().min(1, 'Please choose a membership plan.'),
  periodId: z.string().min(1, 'Please choose a membership period.'),
});

export const paymentSchema = z.object({
  method: z.enum(['cash', 'zaad', 'edahab', 'dahabshiil', 'premier_bank']),
  amount: z
    .string()
    .trim()
    .refine(
      (value) => Number(value.replace(/[^0-9.]/g, '')) > 0,
      'Please enter the amount you paid.'
    ),
  account: z.string().trim().min(1, 'Please enter the account or phone you paid from.'),
  reference: z.string().trim().min(1, 'Please enter the reference or receipt number.'),
  // Political membership is sensitive data, so consent is explicit (build-plan D11).
  acceptedTerms: z.literal(true, { message: 'Please accept the terms to continue.' }),
});

export const registrationSchema = personalSchema
  .extend(addressSchema.shape)
  .extend(planSchema.shape)
  .extend(paymentSchema.shape);

export type RegistrationForm = z.input<typeof registrationSchema>;

const fieldsOf = <T extends z.ZodObject>(schema: T) =>
  Object.keys(schema.shape) as (keyof RegistrationForm)[];

export const STEP_FIELDS: readonly (keyof RegistrationForm)[][] = [
  fieldsOf(personalSchema),
  fieldsOf(addressSchema),
  fieldsOf(planSchema),
  fieldsOf(paymentSchema),
];

export const STEP_COUNT = STEP_FIELDS.length;

/** Which step a server-side field error belongs to, so the wizard can jump there (D7). */
export function stepForField(field: string): number {
  const index = STEP_FIELDS.findIndex((fields) => (fields as readonly string[]).includes(field));
  return index === -1 ? 0 : index;
}

export const emptyRegistration: RegistrationForm = {
  fullName: '',
  gender: undefined as unknown as RegistrationForm['gender'],
  phone: '',
  whatsapp: '',
  email: '',
  birthYear: '',
  education: undefined as unknown as RegistrationForm['education'],
  password: '',
  photoUri: undefined,
  country: 'Somaliland',
  city: '',
  line: '',
  planId: '',
  periodId: '',
  method: 'cash',
  amount: '',
  account: '',
  reference: '',
  acceptedTerms: false as unknown as true,
};
