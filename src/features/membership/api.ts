import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';

import { toMemberCard, toMembershipPeriod, toPlan } from './mappers';
import { cardResponse, meResponse, periodsResponse, plansResponse } from './schemas';
import type { MemberCard, MembershipPeriod, Plan } from './types';

/** Live endpoints, from api-contract/waddani-mobile-api.openapi.json. */
export const membershipApi = {
  async getPlans(): Promise<Plan[]> {
    const data = await request('/mobile/plans', { authenticated: false });
    return parseResponse(plansResponse, data, 'GET /mobile/plans').plans.map(toPlan);
  },

  async getPeriods(): Promise<MembershipPeriod[]> {
    const data = await request('/mobile/membership-periods', { authenticated: false });
    return parseResponse(
      periodsResponse,
      data,
      'GET /mobile/membership-periods'
    ).membershipPeriods.map(toMembershipPeriod);
  },

  /** Identity only — the backend has no endpoint for the full profile. */
  async getMyId(): Promise<string> {
    const data = await request('/mobile/auth/me');
    return parseResponse(meResponse, data, 'GET /mobile/auth/me').member.id;
  },

  async getCard(): Promise<MemberCard> {
    const data = await request('/mobile/members/me/card');
    return toMemberCard(
      parseResponse(cardResponse, data, 'GET /mobile/members/me/card').membershipCard
    );
  },
};

export type MembershipApi = typeof membershipApi;
