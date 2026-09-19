export type Relation = 'spouse' | 'child' | 'parent' | 'sibling';

export type FamilyMemberStatus = 'pending' | 'active' | 'rejected';

export interface FamilyMember {
  id: string;
  fullName: string;
  relation: Relation;
  status: FamilyMemberStatus;
  /** Issued once the office approves them; absent while pending. */
  memberId?: string;
}

export const RELATIONS: Relation[] = ['spouse', 'child', 'parent', 'sibling'];
