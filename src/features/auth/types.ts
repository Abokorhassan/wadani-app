// Data-layer to data-layer, to keep UI out of this module (AGENTS.md).
import type {
  Address,
  EducationLevel,
  Gender,
  Member,
  MemberCard,
} from '@/features/membership/types';
import type { CardCheckout, ChargeRequest } from '@/features/payments/types';

export interface Credentials {
  /** Phone or email — the backend works out which. */
  identifier: string;
  password: string;
}

/**
 * What the wizard collects. Every field the backend requires is here, and
 * nothing it does not accept (api-contract/, POST /mobile/auth/register).
 */
export interface RegistrationPayload {
  fullName: string;
  gender: Gender;
  phone: string;
  whatsapp?: string;
  email?: string;
  /** A URL the backend can reach: registration is rejected without one. */
  photoUrl: string;
  education: EducationLevel;
  professionalWork: string;
  birthYear: number;
  membershipTypeId: string;
  membershipPeriodId: string;
  address: Address;
  password: string;
  charge: ChargeRequest;
}

/**
 * Registration either completes outright (wallet charge) or hands back a
 * Sifalo checkout page to visit first (card). Nothing exists yet in that case.
 */
export type RegistrationResult =
  | { kind: 'registered'; member: Member; card?: MemberCard }
  | { kind: 'checkout'; checkout: CardCheckout };

/** Login is the only call that returns a token; registration does not. */
export interface AuthSession {
  accessToken: string;
  memberId: string;
}
