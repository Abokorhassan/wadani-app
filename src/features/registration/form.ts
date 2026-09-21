import { z } from 'zod';

const currentYear = new Date().getFullYear();

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

/**
 * One schema per wizard step; "Next" validates only the current step
 * (build-plan §1.3 S2). The fields and rules follow the backend contract in
 * api-contract/ — POST /mobile/auth/register — field for field.
 */
export const personalSchema = z.object({
  fullName: z.string().trim().min(1, 'Please enter your full name.'),
  gender: z.enum(['male', 'female'], { message: 'Please choose an option.' }),
  phone: z.string().trim().min(6, 'Please enter your phone number.'),
  whatsapp: optionalText,
  // The backend treats phone as the identity; email is extra.
  email: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
      'Please enter a valid email.'
    ),
  birthYear: z
    .string()
    .trim()
    .min(1, 'Please enter the year you were born.')
    .refine((value) => /^\d{4}$/.test(value), 'Enter a 4-digit year, e.g. 1998.')
    .refine(
      (value) => Number(value) >= 1900 && Number(value) <= currentYear,
      `Enter a year between 1900 and ${currentYear}.`
    ),
  education: z.enum(
    ['primary', 'secondary', 'diploma', 'bachelor', 'master', 'doctorate', 'other'],
    { message: 'Please choose your educational level.' }
  ),
  professionalWork: z.string().trim().min(1, 'Please enter your work or profession.'),
  // The backend's own minimum.
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  photoUri: z.string().optional(),
});

export const addressSchema = z.object({
  line1: z.string().trim().min(1, 'Please enter your street or neighbourhood.'),
  city: z.string().trim().min(1, 'Please enter your city.'),
  region: z.string().trim().min(1, 'Please enter your region.'),
  country: z.string().trim().min(1, 'Please enter your country.'),
  district: optionalText,
});

export const planSchema = z.object({
  planId: z.string().min(1, 'Please choose a membership plan.'),
  periodId: z.string().min(1, 'Please choose a membership period.'),
});

export const paymentSchema = z
  .object({
    method: z.enum(['WAAFI', 'EDAHAB', 'PREMIER_WALLET', 'CARD']),
    amount: z
      .string()
      .trim()
      .refine((value) => Number(value.replace(/[^0-9.]/g, '')) > 0, 'Please enter an amount.'),
    /** The wallet to charge; it may belong to someone paying on your behalf. */
    payerPhone: optionalText,
    // Political membership is sensitive data, so consent is explicit (build-plan D11).
    acceptedTerms: z.literal(true, { message: 'Please accept the terms to continue.' }),
  })
  .refine((values) => values.method === 'CARD' || Boolean(values.payerPhone), {
    path: ['payerPhone'],
    message: 'Please enter the wallet number to charge.',
  });

export const registrationSchema = personalSchema
  .extend(addressSchema.shape)
  .extend(planSchema.shape)
  .extend(paymentSchema.shape)
  .refine((values) => values.method === 'CARD' || Boolean(values.payerPhone), {
    path: ['payerPhone'],
    message: 'Please enter the wallet number to charge.',
  });

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

/** Backend field names that differ from the form's, so errors land correctly. */
const FIELD_ALIASES: Record<string, keyof RegistrationForm> = {
  educationalLevel: 'education',
  photoUrl: 'photoUri',
  membershipTypeId: 'planId',
  membershipPeriodId: 'periodId',
  'address.line1': 'line1',
  'address.city': 'city',
  'address.region': 'region',
  'address.country': 'country',
};

export function formFieldFor(field: string): keyof RegistrationForm | null {
  if (FIELD_ALIASES[field]) return FIELD_ALIASES[field];
  const known = STEP_FIELDS.flat().map(String);
  return known.includes(field) ? (field as keyof RegistrationForm) : null;
}

/** Which step a server-side field error belongs to, so the wizard can jump there (D7). */
export function stepForField(field: string): number {
  const mapped = formFieldFor(field) ?? field;
  const index = STEP_FIELDS.findIndex((fields) => (fields as readonly string[]).includes(mapped));
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
  professionalWork: '',
  password: '',
  photoUri: undefined,
  line1: '',
  city: '',
  region: '',
  country: 'Somaliland',
  district: '',
  planId: '',
  periodId: '',
  method: 'WAAFI',
  amount: '',
  payerPhone: '',
  acceptedTerms: false as unknown as true,
};
