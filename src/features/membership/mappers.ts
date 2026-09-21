import type { MemberDto, MembershipCardDto, MembershipPeriodDto, PlanDto } from './schemas';
import type {
  EducationLevel,
  Gender,
  Member,
  MemberStatus,
  MemberCard,
  MembershipPeriod,
  Plan,
} from './types';

/** DTO → domain. Screens only ever see the domain shape. */

const GENDERS: Record<string, Gender> = { MALE: 'male', FEMALE: 'female' };

const EDUCATION: Record<string, EducationLevel> = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DIPLOMA: 'diploma',
  BACHELOR: 'bachelor',
  MASTER: 'master',
  DOCTORATE: 'doctorate',
  OTHER: 'other',
};

const STATUSES: Record<string, MemberStatus> = {
  REGISTERED: 'registered',
  PAYMENT_PENDING: 'paymentPending',
  PAID: 'paid',
  CARD_ISSUED: 'cardIssued',
};

export const toGenderDto = (gender: Gender): 'MALE' | 'FEMALE' =>
  gender === 'female' ? 'FEMALE' : 'MALE';

export const toEducationDto = (level: EducationLevel) =>
  level.toUpperCase() as Uppercase<EducationLevel>;

/** Amounts are decimal strings on the wire, e.g. "24.00". */
export const toUsd = (value: string): number => Number(value.replace(/[^0-9.-]/g, '')) || 0;

export const toAmountString = (usd: number): string => usd.toFixed(2);

export function toPlan(dto: PlanDto): Plan {
  return {
    id: dto.id,
    name: dto.name,
    priceUsd: toUsd(dto.price),
    stars: dto.stars ?? undefined,
    benefits: dto.benefits,
  };
}

export function toMembershipPeriod(dto: MembershipPeriodDto): MembershipPeriod {
  return { id: dto.id, label: dto.label, months: dto.months };
}

export function toMember(dto: MemberDto): Member {
  return {
    id: dto.id,
    fullName: dto.fullName,
    gender: GENDERS[dto.gender] ?? 'male',
    phone: dto.phone,
    whatsapp: dto.whatsapp ?? undefined,
    email: dto.email ?? undefined,
    photoUrl: dto.photoUrl ?? undefined,
    education: EDUCATION[dto.educationalLevel] ?? 'other',
    professionalWork: dto.professionalWork,
    birthYear: dto.birthYear,
    status: STATUSES[dto.status] ?? 'registered',
    address: {
      line1: dto.address.line1,
      city: dto.address.city,
      region: dto.address.region,
      country: dto.address.country,
      district: dto.address.district ?? undefined,
    },
    membershipTypeId: dto.membershipTypeId,
    membershipPeriodId: dto.membershipPeriodId ?? undefined,
    memberSince: dto.createdAt ?? undefined,
    validUntil: dto.membershipExpiresAt ?? undefined,
    isEligibleForPayment: dto.isEligibleForPayment ?? undefined,
  };
}

export function toMemberCard(dto: MembershipCardDto): MemberCard {
  return {
    id: dto.id,
    memberId: dto.memberId,
    cardCode: dto.cardCode,
    memberFullName: dto.memberFullName,
    photoUrl: dto.photoUrl ?? undefined,
    membershipType: dto.membershipType,
    stars: dto.membershipTypeStars ?? undefined,
    layout: dto.cardLayout === 'HORIZONTAL' ? 'horizontal' : 'vertical',
    validUntil: dto.validUntil,
    issuedAt: dto.issuedAt,
  };
}

/**
 * Membership price for a plan over a period (build-plan D5). The backend takes
 * `amount` as sent and does not check it against the plan, so this is the app's
 * own arithmetic — confirm it with the party before going live.
 */
export function priceFor(plan: Plan, period: MembershipPeriod): number {
  return Math.round(plan.priceUsd * (period.months / 12) * 100) / 100;
}
