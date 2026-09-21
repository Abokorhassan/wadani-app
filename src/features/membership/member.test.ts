import { memberFixture } from './api.mock';
import { toMember } from './mappers';
import { memberDto } from './schemas';

describe('member mapping', () => {
  it('accepts the fixture as a valid backend payload', () => {
    expect(memberDto.safeParse(memberFixture).success).toBe(true);
  });

  it('turns backend nulls into absent fields', () => {
    const member = toMember(memberFixture);
    expect(member.photoUrl).toBeUndefined();
    expect(member.address.district).toBeUndefined();
  });

  it('lowercases the backend enums into the domain ones', () => {
    const member = toMember(memberFixture);
    expect(member.gender).toBe('male');
    expect(member.education).toBe('bachelor');
    expect(member.status).toBe('cardIssued');
  });
});
