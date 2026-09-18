import { mockRespond } from '@/api/mock/latency';

import type { MembershipApi } from './api';
import { toMember, toMembershipPeriod, toPlan } from './mappers';
import type { MemberDto, MembershipPeriodDto, PlanDto } from './schemas';

/** Sample member from the prototype. */
export const memberFixture: MemberDto = {
  id: 'WD-482913',
  fullName: 'Mohamed Shibbin',
  gender: 'male',
  phone: '+252 63 234 5678',
  whatsapp: '+252 63 234 5678',
  email: 'moshibbin@gmail.com',
  birthYear: 1994,
  education: 'bachelor',
  address: { country: 'Somaliland', city: 'Hargeisa', line: null },
  photoUrl: null,
  status: 'active',
  rejectionReason: null,
  plan: { id: 'standard', name: 'Standard' },
  memberSince: '2025-09-12T00:00:00.000Z',
  validUntil: '2027-09-12T00:00:00.000Z',
  // The real payload is a signed token from the backend (build-plan D14).
  qrPayload: 'waddani:member:WD-482913',
};

/** Fixtures from the prototype (build-plan §1.4). */
export const planFixtures: PlanDto[] = [
  {
    id: 'standard',
    name: 'Standard',
    icon: '📇',
    priceUsd: 25,
    benefits: [
      { text: 'Digital membership card & QR check-in', yes: true },
      { text: 'Party news & event invites', yes: true },
      { text: 'Vote in regional meetings', yes: false },
      { text: 'Priority support on WhatsApp', yes: false },
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: '⭐',
    priceUsd: 50,
    benefits: [
      { text: 'Everything in Standard', yes: true },
      { text: 'Vote in regional meetings', yes: true },
      { text: 'Priority support on WhatsApp', yes: true },
      { text: 'Invite to leadership training', yes: false },
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: '👑',
    priceUsd: 100,
    benefits: [
      { text: 'Everything in Silver', yes: true },
      { text: 'Invite to leadership training', yes: true },
      { text: 'Direct line to regional office', yes: true },
      { text: 'Recognition at annual convention', yes: true },
    ],
  },
];

export const periodFixtures: MembershipPeriodDto[] = [
  { id: '1y', label: '1 year', months: 12 },
  { id: '2y', label: '2 years', months: 24 },
];

export const membershipApiMock: MembershipApi = {
  getPlans: () => mockRespond(planFixtures.map(toPlan)),
  getPeriods: () => mockRespond(periodFixtures.map(toMembershipPeriod), 350),
  getMe: () => mockRespond(toMember(memberFixture)),
};
