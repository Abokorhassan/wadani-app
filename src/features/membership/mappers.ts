import type { MemberDto, MembershipPeriodDto, PlanDto } from './schemas';
import type { Member, MembershipPeriod, Plan } from './types';

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

export function toMember(dto: MemberDto): Member {
  return {
    id: dto.id,
    fullName: dto.fullName,
    gender: dto.gender,
    phone: dto.phone,
    whatsapp: dto.whatsapp ?? undefined,
    email: dto.email,
    birthYear: dto.birthYear ?? undefined,
    education: dto.education,
    address: {
      country: dto.address.country,
      city: dto.address.city,
      line: dto.address.line ?? undefined,
    },
    photoUrl: dto.photoUrl ?? undefined,
    status: dto.status,
    rejectionReason: dto.rejectionReason ?? undefined,
    plan: dto.plan,
    memberSince: dto.memberSince ?? undefined,
    validUntil: dto.validUntil ?? undefined,
    qrPayload: dto.qrPayload ?? undefined,
  };
}

/** Membership price for a plan over a period (build-plan D5). */
export function priceFor(plan: Plan, period: MembershipPeriod): number {
  return Math.round(plan.priceUsd * (period.months / 12) * 100) / 100;
}
