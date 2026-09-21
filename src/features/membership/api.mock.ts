import { mockRespond } from '@/api/mock/latency';

import type { MembershipApi } from './api';
import { toMemberCard, toMembershipPeriod, toPlan } from './mappers';
import type {
  MemberDto,
  MembershipCardDto,
  MembershipPeriodDto,
  PlanDto,
} from './schemas';

/** Fixtures mirror the live payloads field for field (api-contract/). */
export const memberFixture: MemberDto = {
  id: '6f1c0f8e-6d6a-4d1a-9f0e-2c7a1b3d4e5f',
  fullName: 'Mohamed Shibbin',
  gender: 'MALE',
  phone: '+252632345678',
  whatsapp: '+252632345678',
  email: 'moshibbin@gmail.com',
  photoUrl: null,
  educationalLevel: 'BACHELOR',
  professionalWork: 'Teacher',
  birthYear: 1994,
  status: 'CARD_ISSUED',
  address: {
    line1: 'Jigjiga Yar',
    city: 'Hargeisa',
    region: 'Woqooyi Galbeed',
    country: 'Somaliland',
    district: null,
  },
  membershipTypeId: '11111111-1111-1111-1111-111111111111',
  membershipPeriodId: '22222222-2222-2222-2222-222222222222',
  createdAt: '2025-09-12T00:00:00.000Z',
  membershipExpiresAt: '2027-09-12T00:00:00.000Z',
  isEligibleForPayment: false,
};

export const cardFixture: MembershipCardDto = {
  id: '33333333-3333-3333-3333-333333333333',
  memberId: memberFixture.id,
  cardCode: 'MC-2026-AB12CD',
  memberFullName: memberFixture.fullName,
  photoUrl: null,
  membershipType: 'Standard',
  membershipTypeStars: 1,
  cardLayout: 'VERTICAL',
  validUntil: '2027-09-12T00:00:00.000Z',
  issuedAt: '2025-09-12T00:00:00.000Z',
};

export const planFixtures: PlanDto[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Standard',
    price: '25.00',
    stars: 1,
    benefits: [
      'Digital membership card & QR check-in',
      'Party news & event invites',
      'Local branch meetings',
    ],
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Silver',
    price: '50.00',
    stars: 2,
    benefits: [
      'Everything in Standard',
      'Vote in regional meetings',
      'Priority support on WhatsApp',
    ],
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Gold',
    price: '100.00',
    stars: 3,
    benefits: [
      'Everything in Silver',
      'Invite to leadership training',
      'Direct line to regional office',
      'Recognition at annual convention',
    ],
  },
];

export const periodFixtures: MembershipPeriodDto[] = [
  { id: '22222222-2222-2222-2222-222222222222', label: '1 year', months: 12 },
  { id: '66666666-6666-6666-6666-666666666666', label: '2 years', months: 24 },
];

/**
 * Which mock account is "signed in" and what each one's card looks like.
 * `getCard()` has to answer for whoever that is, not always the fixture --
 * otherwise every login in mock mode shows the same demo member regardless
 * of which account actually signed in.
 */
const cardRegistry = new Map<string, MembershipCardDto>([[memberFixture.id, cardFixture]]);
let activeMemberId: string = memberFixture.id;

/** Called by the auth mock on login/register, so getCard answers for the right account. */
export function setActiveMockMember(memberId: string): void {
  activeMemberId = memberId;
}

/** Called by the auth mock when a new member is created, to give it a real card. */
export function registerMockCard(memberId: string, card: MembershipCardDto): void {
  cardRegistry.set(memberId, card);
}

export const membershipApiMock: MembershipApi = {
  getPlans: () => mockRespond(planFixtures.map(toPlan)),
  getPeriods: () => mockRespond(periodFixtures.map(toMembershipPeriod), 350),
  getMyId: () => mockRespond(activeMemberId, 200),
  getCard: () => mockRespond(toMemberCard(cardRegistry.get(activeMemberId) ?? cardFixture)),
};
