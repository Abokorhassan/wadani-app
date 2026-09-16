import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';

import { toMembershipPeriod, toPlan } from './mappers';
import { periodsResponse, plansResponse } from './schemas';
import type { MembershipPeriod, Plan } from './types';

/** Live endpoints. Paths are placeholders until the Postman collection lands. */
export const membershipApi = {
  async getPlans(): Promise<Plan[]> {
    const data = await request('/plans', { authenticated: false });
    return parseResponse(plansResponse, data, 'GET /plans').map(toPlan);
  },

  async getPeriods(): Promise<MembershipPeriod[]> {
    const data = await request('/membership-periods', { authenticated: false });
    return parseResponse(periodsResponse, data, 'GET /membership-periods').map(
      toMembershipPeriod
    );
  },
};

export type MembershipApi = typeof membershipApi;
