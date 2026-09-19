import type { EducationLevel, Gender, Member } from '@/features/membership';
import type { PaymentMethodId } from '@/features/payments';

export interface Credentials {
  /** Phone or email — the backend works out which (build-plan S4). */
  identifier: string;
  password: string;
}

/** Everything the registration wizard collects (build-plan D3: nothing is dropped). */
export interface RegistrationPayload {
  fullName: string;
  gender: Gender;
  phone: string;
  whatsapp?: string;
  email: string;
  birthYear?: number;
  education: EducationLevel;
  password: string;
  photoUri?: string;
  address: { country: string; city: string; line?: string };
  planId: string;
  periodId: string;
  payment: {
    method: PaymentMethodId;
    amountUsd: number;
    account: string;
    reference: string;
  };
  acceptedTerms: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  member: Member;
}
