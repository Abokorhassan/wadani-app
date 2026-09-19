import { ApiRequestError } from '@/api/errors';
import { mockRespond } from '@/api/mock/latency';
import { memberFixture } from '@/features/membership/api.mock';
import { toMember } from '@/features/membership/mappers';
import type { MemberDto } from '@/features/membership/schemas';
import { normalizePhone } from '@/lib/format';

import type { AuthApi } from './api';
import type { AuthSession, RegistrationPayload } from './types';

/** The approved member from the fixtures signs in with this password. */
export const DEMO_PASSWORD = 'waddani123';

interface Account {
  member: MemberDto;
  password: string;
}

const accounts: Account[] = [{ member: memberFixture, password: DEMO_PASSWORD }];

const matches = (account: Account, identifier: string) => {
  const value = identifier.trim().toLowerCase();
  return (
    account.member.email.toLowerCase() === value ||
    normalizePhone(account.member.phone) === normalizePhone(value)
  );
};

const sessionFor = (account: Account): AuthSession => ({
  accessToken: `mock-token-${account.member.id}`,
  member: toMember(account.member),
});

export const authApiMock: AuthApi = {
  login: async ({ identifier, password }) => {
    await mockRespond(null, 600);
    const account = accounts.find((candidate) => matches(candidate, identifier));

    if (!account) {
      throw new ApiRequestError({
        kind: 'validation',
        fieldErrors: { identifier: 'No account found for that phone or email.' },
      });
    }
    // The password is checked, unlike the prototype (build-plan D1).
    if (account.password !== password) {
      throw new ApiRequestError({
        kind: 'validation',
        fieldErrors: { password: 'That password is not right.' },
      });
    }
    return sessionFor(account);
  },

  register: async (payload: RegistrationPayload) => {
    await mockRespond(null, 900);

    // The backend enforces this too; the mock mirrors it so the UI can be tested (D7).
    const taken = accounts.find(
      (account) => account.member.email.toLowerCase() === payload.email.trim().toLowerCase()
    );
    if (taken) {
      throw new ApiRequestError({
        kind: 'validation',
        fieldErrors: { email: 'An account with this email already exists.' },
      });
    }

    const member: MemberDto = {
      id: `WD-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: payload.fullName,
      gender: payload.gender,
      phone: payload.phone,
      whatsapp: payload.whatsapp ?? null,
      email: payload.email,
      birthYear: payload.birthYear ?? null,
      education: payload.education,
      address: {
        country: payload.address.country,
        city: payload.address.city,
        line: payload.address.line ?? null,
      },
      photoUrl: payload.photoUri ?? null,
      status: 'pending',
      rejectionReason: null,
      plan: { id: payload.planId, name: payload.planId },
      memberSince: null,
      validUntil: null,
      qrPayload: null,
    };

    accounts.push({ member, password: payload.password });
    return sessionFor({ member, password: payload.password });
  },

  logout: () => mockRespond(undefined, 200),
};
