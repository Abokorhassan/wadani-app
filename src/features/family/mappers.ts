import type { FamilyMemberDto } from './schemas';
import type { FamilyMember, FamilyMemberStatus } from './types';

const KNOWN: FamilyMemberStatus[] = ['pending', 'active', 'rejected'];

export function toFamilyMember(dto: FamilyMemberDto): FamilyMember {
  const status = dto.status.toLowerCase() as FamilyMemberStatus;
  return {
    id: dto.id,
    fullName: dto.fullName,
    relation: dto.relation,
    status: KNOWN.includes(status) ? status : 'pending',
    memberId: dto.memberId ?? undefined,
  };
}
