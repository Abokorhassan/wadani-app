import { z } from 'zod';

/**
 * Backend payload shapes (DTOs), taken from the OpenAPI document in
 * api-contract/. Only this file and mappers.ts know the backend's field names.
 */

const optional = <T extends z.ZodType>(schema: T) => schema.nullish();

/** Money crosses the wire as a decimal string, e.g. "24.00". */
export const decimalString = z.string();

export const planDto = z.object({
  id: z.string(),
  name: z.string(),
  price: decimalString,
  benefits: z.array(z.string()).default([]),
  stars: optional(z.number().int()),
});

export const plansResponse = z.object({ plans: z.array(planDto) });

export const membershipPeriodDto = z.object({
  id: z.string(),
  label: z.string(),
  months: z.number().int().positive(),
});

export const periodsResponse = z.object({ membershipPeriods: z.array(membershipPeriodDto) });

export const addressDto = z.object({
  line1: z.string(),
  city: z.string(),
  region: z.string(),
  country: z.string(),
  district: optional(z.string()),
});

export const genderDto = z.enum(['MALE', 'FEMALE']);

export const educationDto = z.enum([
  'PRIMARY',
  'SECONDARY',
  'DIPLOMA',
  'BACHELOR',
  'MASTER',
  'DOCTORATE',
  'OTHER',
]);

export const memberStatusDto = z.enum(['REGISTERED', 'PAYMENT_PENDING', 'PAID', 'CARD_ISSUED']);

export const memberDto = z.object({
  id: z.string(),
  fullName: z.string(),
  gender: genderDto,
  phone: z.string(),
  whatsapp: optional(z.string()),
  email: optional(z.string()),
  photoUrl: optional(z.string()),
  educationalLevel: educationDto,
  professionalWork: z.string(),
  birthYear: z.number().int(),
  status: memberStatusDto,
  address: addressDto,
  membershipTypeId: z.string(),
  membershipPeriodId: optional(z.string()),
  createdAt: optional(z.string()),
  membershipExpiresAt: optional(z.string()),
  isEligibleForPayment: optional(z.boolean()),
});

export const membershipCardDto = z.object({
  id: z.string(),
  memberId: z.string(),
  cardCode: z.string(),
  memberFullName: z.string(),
  photoUrl: optional(z.string()),
  membershipType: z.string(),
  membershipTypeStars: optional(z.number().int()),
  cardLayout: z.enum(['HORIZONTAL', 'VERTICAL']).default('VERTICAL'),
  validUntil: z.string(),
  issuedAt: z.string(),
});

export const cardResponse = z.object({ membershipCard: membershipCardDto });

/** `GET /mobile/auth/me` carries the id and nothing else. */
export const meResponse = z.object({
  member: z.object({ id: z.string(), organizationId: optional(z.string()) }),
});

export type PlanDto = z.infer<typeof planDto>;
export type MembershipPeriodDto = z.infer<typeof membershipPeriodDto>;
export type MemberDto = z.infer<typeof memberDto>;
export type MembershipCardDto = z.infer<typeof membershipCardDto>;
