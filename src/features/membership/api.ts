import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';

import { toMember, toMembershipPeriod, toPlan } from './mappers';
import { memberDto, periodsResponse, plansResponse } from './schemas';
import type { Member, MembershipPeriod, Plan } from './types';

/** Live endpoints. Paths are placeholders until the Postman collection lands. */
export const membershipApi = {
  async getPlans(): Promise<Plan[]> {
    const data = await request('/plans', { authenticated: false });
    return parseResponse(plansResponse, data, 'GET /plans').map(toPlan);
  },

  async getPeriods(): Promise<MembershipPeriod[]> {
    const data = await request('/membership-periods', { authenticated: false });
    return parseResponse(periodsResponse, data, 'GET /membership-periods').map(toMembershipPeriod);
  },

  /** The signed-in member: profile, status, tier and card details. */
  async getMe(): Promise<Member> {
    const data = await request('/me');
    return toMember(parseResponse(memberDto, data, 'GET /me'));
  },
};

export type MembershipApi = typeof membershipApi;
