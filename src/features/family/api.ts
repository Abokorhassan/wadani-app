import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';

import { toFamilyMember } from './mappers';
import { familyMemberDto, familyResponse } from './schemas';
import type { FamilyMember, Relation } from './types';

export interface NewFamilyMember {
  fullName: string;
  relation: Relation;
}

/** Live endpoints. Paths are placeholders until the Postman collection lands. */
export const familyApi = {
  async getFamily(): Promise<FamilyMember[]> {
    const data = await request('/me/family');
    return parseResponse(familyResponse, data, 'GET /me/family').map(toFamilyMember);
  },

  async addFamilyMember(input: NewFamilyMember): Promise<FamilyMember> {
    const data = await request('/me/family', { method: 'POST', body: input });
    return toFamilyMember(parseResponse(familyMemberDto, data, 'POST /me/family'));
  },
};

export type FamilyApi = typeof familyApi;
