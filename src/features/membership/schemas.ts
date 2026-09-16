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

export type PlanDto = z.infer<typeof planDto>;
export type MembershipPeriodDto = z.infer<typeof membershipPeriodDto>;
