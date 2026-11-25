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
  /** The fixed price, or the lowest amount accepted when `priceMax` is set. */
  price: decimalString,
  /** Set for a range-priced plan: the highest amount accepted. null = fixed price. */
  priceMax: optional(decimalString),
  /** The plan's badge, ready to load. null when staff uploaded none. */
  iconUrl: optional(z.string()),
  benefits: z.array(z.string()).default([]),
  stars: optional(z.number().int()),
  /**
   * FIXED: the plan sets the membership length, durationMonths, and its price
   * covers that whole period. SELECTABLE (or absent, before 2026-11): the
   * member chooses the months and pays the price for each one.
   */
  durationType: optional(z.string()),
  durationMonths: optional(z.number().int()),
});

export const plansResponse = z.object({ plans: z.array(planDto) });

/** GET /mobile/members/me/plan: a plans-list item, plus description and parent. */
export const myPlanDto = planDto.extend({
  description: optional(z.string()),
  /** The top-level plan, when the member is on one of its sub-types. */
  parent: optional(z.object({ id: z.string(), name: z.string() })),
});

/** plan is null only when staff deleted it after the member joined. */
export const myPlanResponse = z.object({ plan: myPlanDto.nullable() });

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

/** `GET /mobile/auth/me` now returns the caller's full member record. */
export const meResponse = z.object({ member: memberDto });

export type PlanDto = z.infer<typeof planDto>;
export type MyPlanDto = z.infer<typeof myPlanDto>;
export type MembershipPeriodDto = z.infer<typeof membershipPeriodDto>;
export type MemberDto = z.infer<typeof memberDto>;
export type MembershipCardDto = z.infer<typeof membershipCardDto>;
