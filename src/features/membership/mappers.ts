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

/**
 * The backend's own rule (isFreeMembershipType): no maximum and a price of
 * zero. Read from the raw values, not the tidied plan, so the app and the
 * server never disagree: a range that starts at 0 is not free, and the price
 * may arrive as "0" or "0.00".
 */
export const isFreePlanDto = (dto: Pick<PlanDto, 'price' | 'priceMax'>): boolean =>
  !dto.priceMax && Number(dto.price) === 0;

export function toPlan(dto: PlanDto): Plan {
  const priceMax = dto.priceMax ? toUsd(dto.priceMax) : undefined;
  return {
    id: dto.id,
    name: dto.name,
    priceUsd: toUsd(dto.price),
    // A max at or below the min would make the range meaningless, so treat it as fixed.
    priceMaxUsd: priceMax !== undefined && priceMax > toUsd(dto.price) ? priceMax : undefined,
    free: isFreePlanDto(dto),
    iconUrl: dto.iconUrl || undefined,
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

/** A range-priced plan lets the member choose an amount between two figures. */
export const isRangePlan = (plan: Plan): boolean => plan.priceMaxUsd !== undefined;

/** The monthly amounts a plan accepts: one figure for a fixed price. */
export function planRange(plan: Plan): { min: number; max: number } {
  return { min: plan.priceUsd, max: plan.priceMaxUsd ?? plan.priceUsd };
}

/**
 * Whether a monthly amount suits the plan. The backend charges whatever amount
 * it is sent and checks neither end of the range, so the app has to.
 */
export function amountInPlanRange(plan: Plan, monthlyUsd: number): boolean {
  const { min, max } = planRange(plan);
  return monthlyUsd >= min && monthlyUsd <= max;
}

/**
 * What a membership costs (2026-10-06): the monthly amount the member chose
 * from the plan's range, for each month they typed. A fixed-price plan's
 * monthly amount is simply its price.
 */
export function membershipTotal(monthlyUsd: number, months: number): number {
  return Math.round(monthlyUsd * months * 100) / 100;
}

/**
 * The badge for the plan a card belongs to.
 *
 * `GET /mobile/members/me/card` carries the plan's name but not its icon, so
 * the two are joined by name. That is only trusted when exactly one plan has
 * that name: with a duplicate, or a plan renamed since the card was issued, no
 * badge is safer than the wrong one. Ask the backend to add the icon to the
 * card and this goes away (docs/api-gaps.md).
 */
export function badgeForPlanName(plans: Plan[], planName: string | undefined): string | undefined {
  return planNamed(plans, planName)?.iconUrl;
}

/** The one plan with this name, or undefined when none or several have it. */
function planNamed(plans: Plan[], planName: string | undefined): Plan | undefined {
  if (!planName) return undefined;
  const wanted = planName.trim().toLowerCase();
  const matches = plans.filter((plan) => plan.name.trim().toLowerCase() === wanted);
  return matches.length === 1 ? matches[0] : undefined;
}

/**
 * Whether a member's plan is free, so their card shows no badge. The card does
 * not carry the price, so the plan is found by the member's plan id, or else
 * by the card's plan name (MOBILE_FREE_PLAN.md §3).
 */
export function isOnFreePlan(
  plans: Plan[],
  planId: string | undefined,
  planName: string | undefined
): boolean {
  const plan = plans.find((candidate) => candidate.id === planId) ?? planNamed(plans, planName);
  return plan?.free === true;
}
