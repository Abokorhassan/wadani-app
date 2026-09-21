import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';
import { toEducationDto, toGenderDto, toMember, toMemberCard } from '@/features/membership/mappers';
import { asCardCheckout, chargeBody } from '@/features/payments/api';
import { decodeJwtClaims } from '@/lib/jwt';

import { loginResponse, registerResponse } from './schemas';
import type { AuthSession, Credentials, RegistrationPayload, RegistrationResult } from './types';

function registerBody(payload: RegistrationPayload): Record<string, unknown> {
  return {
    fullName: payload.fullName,
    gender: toGenderDto(payload.gender),
    phone: payload.phone,
    ...(payload.whatsapp ? { whatsapp: payload.whatsapp } : {}),
    ...(payload.email ? { email: payload.email } : {}),
    photoUrl: payload.photoUrl,
    educationalLevel: toEducationDto(payload.education),
    professionalWork: payload.professionalWork,
    birthYear: payload.birthYear,
    membershipTypeId: payload.membershipTypeId,
    membershipPeriodId: payload.membershipPeriodId,
    address: payload.address,
    password: payload.password,
    ...chargeBody(payload.charge),
  };
}

export const authApi = {
  async login(credentials: Credentials): Promise<AuthSession> {
    const data = await request('/mobile/auth/login', {
      method: 'POST',
      body: credentials,
      authenticated: false,
    });
    const parsed = parseResponse(loginResponse, data, 'POST /mobile/auth/login');

    // The API has no profile endpoint, so anything the login response or the
    // token carries is all the app gets (docs/api-gaps.md, question 4). Both
    // are reported once here, in development, so we can see what is on offer
    // rather than guessing from the spec.
    if (__DEV__) {
      const { accessToken: _token, memberId: _id, ...extra } = parsed;
      const claims = decodeJwtClaims(parsed.accessToken);
      console.log('[auth] login response, beyond accessToken/memberId:', extra);
      console.log('[auth] access-token claims:', claims ?? '(not a JWT)');
    }

    return parsed;
  },

  /**
   * Creates the member and charges the plan fee in one call. A wallet charge
   * finishes here; a card charge returns a checkout to visit first, and only
   * `POST /mobile/payments/card/confirm` creates the member.
   */
  async register(payload: RegistrationPayload): Promise<RegistrationResult> {
    const data = await request('/mobile/auth/register', {
      method: 'POST',
      body: registerBody(payload),
      authenticated: false,
    });

    const checkout = asCardCheckout(data);
    if (checkout) return { kind: 'checkout', checkout };

    const parsed = parseResponse(registerResponse, data, 'POST /mobile/auth/register');
    return {
      kind: 'registered',
      member: toMember(parsed.member),
      card: parsed.membershipCard ? toMemberCard(parsed.membershipCard) : undefined,
    };
  },

  async logout(): Promise<void> {
    await request('/mobile/auth/logout', { method: 'POST' });
  },

  async requestPasswordReset(identifier: string): Promise<void> {
    await request('/mobile/auth/password/forgot', {
      method: 'POST',
      body: { identifier },
      authenticated: false,
    });
  },
};

export type AuthApi = typeof authApi;
