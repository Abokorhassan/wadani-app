import { mockRespond } from '@/api/mock/latency';

import type { FamilyApi } from './api';
import { toFamilyMember } from './mappers';
import type { FamilyMemberDto } from './schemas';

/** Sample family from the prototype. */
export const familyFixtures: FamilyMemberDto[] = [
  {
    id: 'fam-1',
    fullName: 'Faduma Shibbin',
    relation: 'spouse',
    status: 'active',
    memberId: 'WD-482914',
  },
  {
    id: 'fam-2',
    fullName: 'Abdullahi Shibbin',
    relation: 'child',
    status: 'active',
    memberId: 'WD-482915',
  },
];

/** Added members live here for the session, so the list behaves like the real thing. */
const added: FamilyMemberDto[] = [];

export const familyApiMock: FamilyApi = {
  getFamily: () => mockRespond([...familyFixtures, ...added].map(toFamilyMember)),

  addFamilyMember: async (input) => {
    // New members wait for the office to approve them, so no member ID yet (D24).
    const created: FamilyMemberDto = {
      id: `fam-${familyFixtures.length + added.length + 1}`,
      fullName: input.fullName,
      relation: input.relation,
      status: 'pending',
      memberId: null,
    };
    added.push(created);
    return mockRespond(toFamilyMember(created), 400);
  },
};
