import { ApiRequestError } from '@/api/errors';
import { mockRespond } from '@/api/mock/latency';
import {
  memberFixture,
  cardFixture,
  planFixtures,
  registerMockCard,
  setActiveMockMember,
} from '@/features/membership/api.mock';
import { toEducationDto, toGenderDto, toMember, toMemberCard } from '@/features/membership/mappers';
import type { MemberDto } from '@/features/membership/schemas';
import { samePhone } from '@/lib/phone';

import type { AuthApi } from './api';
import type { RegistrationPayload } from './types';

/** The member from the fixtures signs in with this password. */
export const DEMO_PASSWORD = 'waddani123';

/** The mock "emails" this reset code for every account. */
export const DEMO_RESET_CODE = '123456';

interface Account {
  member: MemberDto;
  password: string;
}

const accounts: Account[] = [{ member: memberFixture, password: DEMO_PASSWORD }];

const matches = (account: Account, identifier: string) => {
  const value = identifier.trim().toLowerCase();
  return (
    (account.member.email ?? '').toLowerCase() === value ||
    samePhone(account.member.phone, identifier)
  );
};

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
    if (account.password !== password) {
      throw new ApiRequestError({
        kind: 'validation',
        fieldErrors: { password: 'That password is not right.' },
      });
    }
    // getCard() answers for whichever account this is, not always the fixture.
    setActiveMockMember(account.member.id);
    return { accessToken: `mock-token-${account.member.id}`, memberId: account.member.id };
  },

  register: async (payload: RegistrationPayload) => {
    await mockRespond(null, 900);

    // The backend enforces this too; the mock mirrors it so the UI can be tested.
    const taken = accounts.find((account) => samePhone(account.member.phone, payload.phone));
    if (taken) {
      throw new ApiRequestError({
        kind: 'validation',
        fieldErrors: { phone: 'A member with this phone number already exists.' },
      });
    }
    const email = payload.email?.trim().toLowerCase();
    if (email && accounts.some((account) => (account.member.email ?? '').toLowerCase() === email)) {
      throw new ApiRequestError({
        kind: 'validation',
        fieldErrors: { email: 'A member with this email already exists' },
      });
    }

    const plan = planFixtures.find((candidate) => candidate.id === payload.membershipTypeId);
    const member: MemberDto = {
      ...memberFixture,
      id: `mock-${Date.now()}`,
      fullName: payload.fullName,
      gender: toGenderDto(payload.gender),
      phone: payload.phone,
      whatsapp: payload.whatsapp ?? null,
      email: payload.email ?? null,
      photoUrl: payload.photoUrl,
      educationalLevel: toEducationDto(payload.education),
      professionalWork: payload.professionalWork,
      birthYear: payload.birthYear,
      status: 'CARD_ISSUED',
      address: { ...payload.address, district: payload.address.district ?? null },
      membershipTypeId: payload.membershipTypeId,
      membershipPeriodId: memberFixture.membershipPeriodId,
      createdAt: new Date().toISOString(),
      isEligibleForPayment: false,
    };

    accounts.push({ member, password: payload.password });

    const cardDto = {
      ...cardFixture,
      memberId: member.id,
      memberFullName: member.fullName,
      photoUrl: payload.photoUrl,
      membershipType: plan?.name ?? cardFixture.membershipType,
      membershipTypeStars: plan ? (plan.stars ?? null) : cardFixture.membershipTypeStars,
    };
    // So a later login, or a refetch, keeps showing this member, not the fixture.
    registerMockCard(member.id, cardDto);
    setActiveMockMember(member.id);

    /*
     * A card payment answers with a checkout instead. The real backend creates
     * the member only once the payment is confirmed; the mock creates it now so
     * the login after the (mock) checkout has an account to find.
     */
    if (payload.charge?.method === 'CARD') {
      const checkoutId = `mock-checkout-${Date.now()}`;
      return {
        kind: 'checkout' as const,
        checkout: { checkoutId, checkoutUrl: `mock://sifalo-checkout?checkout_id=${checkoutId}` },
      };
    }

    return {
      kind: 'registered' as const,
      member: toMember(member),
      card: toMemberCard(cardDto),
    };
  },

  emailExists: async (email) => {
    const value = email.trim().toLowerCase();
    const taken = accounts.some((account) => (account.member.email ?? '').toLowerCase() === value);
    return mockRespond(taken, 250);
  },

  logout: () => mockRespond(undefined, 200),
  requestPasswordReset: () => mockRespond(undefined, 500),

  resetPassword: async ({ identifier, otp, newPassword }) => {
    await mockRespond(null, 600);
    const account = accounts.find((candidate) => matches(candidate, identifier));
    // Same answer for an unknown account and a wrong code, as the API does.
    if (!account || otp !== DEMO_RESET_CODE) {
      throw new ApiRequestError({
        kind: 'validation',
        fieldErrors: {},
        message: 'Invalid or expired OTP',
      });
    }
    account.password = newPassword;
  },
};
