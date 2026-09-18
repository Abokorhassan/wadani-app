import { z } from 'zod';

/**
 * Backend payload shapes (DTOs).
 *
 * These follow the prototype's shape for now and will be rewritten from the
 * Postman collection's example responses (build-plan §4.6). Only this file and
 * mappers.ts change when the backend's field names differ.
 */

export const planBenefitDto = z.object({
  text: z.string(),
  yes: z.boolean(),
});

export const planDto = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().default(''),
  priceUsd: z.number(),
  benefits: z.array(planBenefitDto),
});

export const plansResponse = z.array(planDto);

export const membershipPeriodDto = z.object({
  id: z.string(),
  label: z.string(),
  months: z.number().int().positive(),
});

export const periodsResponse = z.array(membershipPeriodDto);

const optional = <T extends z.ZodType>(schema: T) => schema.nullish();

export const memberDto = z.object({
  id: z.string(),
  fullName: z.string(),
  gender: z.enum(['male', 'female']),
  phone: z.string(),
  whatsapp: optional(z.string()),
  email: z.string(),
  birthYear: optional(z.number().int()),
  education: z.enum(['none', 'primary', 'secondary', 'diploma', 'bachelor', 'master', 'phd']),
  address: z.object({
    country: z.string(),
    city: z.string(),
    line: optional(z.string()),
  }),
  photoUrl: optional(z.string()),
  status: z.enum(['pending', 'active', 'rejected', 'expired']),
  rejectionReason: optional(z.string()),
  plan: z.object({ id: z.string(), name: z.string() }),
  memberSince: optional(z.string()),
  validUntil: optional(z.string()),
  qrPayload: optional(z.string()),
});

export type PlanDto = z.infer<typeof planDto>;
export type MembershipPeriodDto = z.infer<typeof membershipPeriodDto>;
export type MemberDto = z.infer<typeof memberDto>;
