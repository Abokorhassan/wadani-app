import type { MembershipPeriodDto, PlanDto } from './schemas';
import type { MembershipPeriod, Plan } from './types';

/** DTO → domain. Screens only ever see the domain shape. */

export function toPlan(dto: PlanDto): Plan {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon,
    priceUsd: dto.priceUsd,
    benefits: dto.benefits.map((benefit) => ({
      text: benefit.text,
      included: benefit.yes,
    })),
  };
}

export function toMembershipPeriod(dto: MembershipPeriodDto): MembershipPeriod {
  return { id: dto.id, label: dto.label, months: dto.months };
}

/** Membership price for a plan over a period (build-plan D5). */
export function priceFor(plan: Plan, period: MembershipPeriod): number {
  return Math.round(plan.priceUsd * (period.months / 12) * 100) / 100;
}
