import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';
import { toEducationDto, toGenderDto, toMember, toMemberCard } from '@/features/membership/mappers';
import { asCardCheckout, chargeBody } from '@/features/payments/api';
import { decodeJwtClaims } from '@/lib/jwt';
import { toInternationalPhone } from '@/lib/phone';

import { emailExistsResponse, loginResponse, registerResponse } from './schemas';
import type {
  AuthSession,
  Credentials,
  PasswordChangeInput,
  PasswordResetInput,
  RegistrationPayload,
  RegistrationResult,
} from './types';

/**
 * Registration stores the phone in international form, so a phone typed the way
 * people write it ("63 234 5678") has to be turned into that to match. An email,
 * or anything that is not a phone, goes through untouched.
 */
function toIdentifier(raw: string): string {
  const identifier = raw.trim();
  return identifier.includes('@') ? identifier : (toInternationalPhone(identifier) ?? identifier);
}

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
    ...(payload.membershipMonths ? { membershipMonths: payload.membershipMonths } : {}),
    address: payload.address,
    password: payload.password,
    // A free plan sends no payment fields at all.
    ...(payload.charge ? chargeBody(payload.charge) : {}),
  };
}

export const authApi = {
  async login(credentials: Credentials): Promise<AuthSession> {
    const data = await request('/mobile/auth/login', {
      method: 'POST',
      body: { ...credentials, identifier: toIdentifier(credentials.identifier) },
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

    return {
      accessToken: parsed.accessToken,
      memberId: parsed.memberId,
      mustChangePassword: parsed.mustChangePassword === true,
    };
  },

  /**
   * Creates the member and charges the plan fee in one call. A wallet charge
   * finishes here; a card charge returns a checkout to visit first, and only
   * `POST /mobile/payments/card/confirm` creates the member. A free plan charges
   * nothing and finishes here like a wallet.
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

  /**
   * Whether another member already uses this email (case-insensitive), so the
   * form can say so under the field instead of after the whole registration.
   */
  async emailExists(email: string): Promise<boolean> {
    const data = await request('/mobile/auth/email-exists', {
      method: 'POST',
      body: { email: email.trim() },
      authenticated: false,
    });
    return parseResponse(emailExistsResponse, data, 'POST /mobile/auth/email-exists').exists;
  },

  async logout(): Promise<void> {
    await request('/mobile/auth/logout', { method: 'POST' });
  },

  /**
   * Emails a 6-digit code, valid for 10 minutes. A 404 means no member has that
   * phone or email; a 422 with code NO_EMAIL_ON_FILE means the member has no
   * email to send it to.
   */
  async requestPasswordReset(identifier: string): Promise<void> {
    await request('/mobile/auth/password/forgot', {
      method: 'POST',
      body: { identifier: toIdentifier(identifier) },
      authenticated: false,
    });
  },

  /**
   * Changes the password of the signed-in member. Required straight after a
   * login that returned mustChangePassword, and allowed at any time. A wrong
   * current password is a 400 with code WRONG_CURRENT_PASSWORD.
   */
  async changePassword(input: PasswordChangeInput): Promise<void> {
    await request('/mobile/auth/password/change', { method: 'POST', body: input });
  },

  /** A wrong, expired or used code comes back as a 400 "Invalid or expired OTP". */
  async resetPassword(input: PasswordResetInput): Promise<void> {
    await request('/mobile/auth/password/reset', {
      method: 'POST',
      body: { ...input, identifier: toIdentifier(input.identifier) },
      authenticated: false,
    });
  },
};

export type AuthApi = typeof authApi;
