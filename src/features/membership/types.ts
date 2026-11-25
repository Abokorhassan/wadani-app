/**
 * Domain model (build-plan §3.3), mapped from the backend shapes in
 * api-contract/waddani-mobile-api.openapi.json.
 */

/**
 * The backend's own member lifecycle. There is no approval step: a member who
 * pays is created already paid, with a card (build-plan D2, revised 2026-09-19).
 */
export type MemberStatus = 'registered' | 'paymentPending' | 'paid' | 'cardIssued';

export type EducationLevel =
  'primary' | 'secondary' | 'diploma' | 'bachelor' | 'master' | 'doctorate' | 'other';

export type Gender = 'male' | 'female';

export interface Plan {
  id: string;
  name: string;
  /** The fixed price, or the lowest amount accepted for a range-priced plan. */
  priceUsd: number;
  /** Highest amount accepted; present only for a range-priced plan. */
  priceMaxUsd?: number;
  /**
   * A fixed price of zero: the member joins without paying, and the card
   * carries no badge (platform/docs/MOBILE_FREE_PLAN.md).
   */
  free: boolean;
  /**
   * A fixed-length plan: every member gets this many months, which they do not
   * choose, and the price is paid once for the whole period, not per month
   * (backend, 2026-11-22). Absent when the member chooses the months.
   */
  fixedMonths?: number;
  /** The badge everyone who pays for this plan carries. Absent when none was uploaded. */
  iconUrl?: string;
  /** Tier rank the backend gives the plan; drives the card's rosette count. */
  stars?: number;
  benefits: string[];
}

export interface MembershipPeriod {
  id: string;
  label: string;
  months: number;
}

export interface Address {
  line1: string;
  city: string;
  region: string;
  country: string;
  district?: string;
}

/**
 * The full member record. Only registration (and the card-payment confirm that
 * finishes it) returns this — `GET /mobile/auth/me` gives the id alone, so on a
 * device the member never registered from, this is what we cached, or nothing
 * (docs/api-gaps.md, question 5).
 */
export interface Member {
  id: string;
  fullName: string;
  gender: Gender;
  phone: string;
  whatsapp?: string;
  email?: string;
  photoUrl?: string;
  education: EducationLevel;
  professionalWork: string;
  birthYear: number;
  status: MemberStatus;
  address: Address;
  membershipTypeId: string;
  membershipPeriodId?: string;
  memberSince?: string;
  validUntil?: string;
  /** False while the current period still has time left; the renew call 409s. */
  isEligibleForPayment?: boolean;
}

/** Issued by the backend during registration; the member never edits it. */
export interface MemberCard {
  id: string;
  memberId: string;
  /** The QR value, e.g. "MC-2026-AB12CD". */
  cardCode: string;
  memberFullName: string;
  photoUrl?: string;
  membershipType: string;
  stars?: number;
  layout: 'horizontal' | 'vertical';
  validUntil: string;
  issuedAt: string;
}

/** Kept in the session so the app can open before anything is fetched. */
export interface MemberSummary {
  id: string;
  fullName: string;
  status: MemberStatus;
}
