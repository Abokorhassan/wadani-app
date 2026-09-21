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
import { normalizePhone } from '@/lib/format';

import type { AuthApi } from './api';
import type { RegistrationPayload } from './types';

/** The member from the fixtures signs in with this password. */
export const DEMO_PASSWORD = 'waddani123';

interface Account {
  member: MemberDto;
  password: string;
}

const accounts: Account[] = [{ member: memberFixture, password: DEMO_PASSWORD }];

const matches = (account: Account, identifier: string) => {
  const value = identifier.trim().toLowerCase();
  return (
    (account.member.email ?? '').toLowerCase() === value ||
    normalizePhone(account.member.phone) === normalizePhone(value)
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
    const taken = accounts.find(
      (account) => normalizePhone(account.member.phone) === normalizePhone(payload.phone)
    );
    if (taken) {
      throw new ApiRequestError({
        kind: 'validation',
        fieldErrors: { phone: 'A member with this phone number already exists.' },
      });
    }

    // A card payment creates nothing until the checkout comes back (§4).
    if (payload.charge.method === 'CARD') {
      return {
        kind: 'checkout' as const,
        checkout: {
          checkoutId: '77777777-7777-7777-7777-777777777777',
          checkoutUrl: 'https://checkout.sifalopay.com/mock-session',
        },
      };
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
      membershipPeriodId: payload.membershipPeriodId,
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
      membershipTypeStars: plan?.stars ?? cardFixture.membershipTypeStars,
    };
    // So a later login, or a refetch, keeps showing this member, not the fixture.
    registerMockCard(member.id, cardDto);
    setActiveMockMember(member.id);

    return {
      kind: 'registered' as const,
      member: toMember(member),
      card: toMemberCard(cardDto),
    };
  },

  logout: () => mockRespond(undefined, 200),
  requestPasswordReset: () => mockRespond(undefined, 500),
};
