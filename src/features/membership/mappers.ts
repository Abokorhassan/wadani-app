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
  const priceMax = dto.priceMax ? toUsd(dto.priceMax) : undefined;
  return {
    id: dto.id,
    name: dto.name,
    priceUsd: toUsd(dto.price),
    // A max at or below the min would make the range meaningless, so treat it as fixed.
    priceMaxUsd: priceMax !== undefined && priceMax > toUsd(dto.price) ? priceMax : undefined,
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

/** Why an amount does not suit a plan, or null when it does. */
export type AmountProblem = 'tooLow' | 'tooHigh';

/**
 * The backend charges whatever amount it is sent. It checks neither a plan's
 * price nor a range-priced plan's limits (api-contract/, POST /mobile/auth/register
 * `amount`), so the app has to: nothing below the price, and for a range-priced
 * plan nothing above its top either.
 */
export function amountProblem(plan: Plan, amountUsd: number): AmountProblem | null {
  if (amountUsd < plan.priceUsd) return 'tooLow';
  if (plan.priceMaxUsd !== undefined && amountUsd > plan.priceMaxUsd) return 'tooHigh';
  return null;
}

export const amountWithinPlan = (plan: Plan, amountUsd: number): boolean =>
  amountProblem(plan, amountUsd) === null;

/**
 * The amount offered by default for a plan (build-plan D5, revised 2026-09-21).
 *
 * It comes from the plan alone: the price, or for a range-priced plan the
 * lowest amount it accepts. The period only decides how long the membership
 * lasts. The prototype prefills the plan's price whatever period is chosen, and
 * the API gives a period no price at all (`{id, label, months}`), so scaling by
 * years, as an earlier version did, had no source and overcharged anyone
 * choosing more than one year.
 */
export function defaultAmount(plan: Plan): number {
  return plan.priceUsd;
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
  if (!planName) return undefined;
  const wanted = planName.trim().toLowerCase();
  const matches = plans.filter((plan) => plan.name.trim().toLowerCase() === wanted);
  return matches.length === 1 ? matches[0].iconUrl : undefined;
}
