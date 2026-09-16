/** Domain model (build-plan §3.3). Backend shapes are mapped into these. */

export type MembershipStatus = 'pending' | 'active' | 'rejected' | 'expired';

export type EducationLevel =
  'none' | 'primary' | 'secondary' | 'diploma' | 'bachelor' | 'master' | 'phd';

export type Gender = 'male' | 'female';

export interface PlanBenefit {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  icon: string;
  priceUsd: number;
  benefits: PlanBenefit[];
}

export interface MembershipPeriod {
  id: string;
  label: string;
  months: number;
}

export interface Address {
  country: string;
  city: string;
  line?: string;
}

export interface Member {
  id: string;
  fullName: string;
  gender: Gender;
  phone: string;
  whatsapp?: string;
  email: string;
  birthYear?: number;
  education: EducationLevel;
  address: Address;
  photoUrl?: string;
  status: MembershipStatus;
  rejectionReason?: string;
  plan: Pick<Plan, 'id' | 'name'>;
  memberSince?: string;
  validUntil?: string;
  /** Signed token rendered as the card's QR code (build-plan D14). */
  qrPayload?: string;
}

/** The little we keep in the session, before `GET /me` has run. */
export interface MemberSummary {
  id: string;
  fullName: string;
  status: MembershipStatus;
}
