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
    expect(member.address.line).toBeUndefined();
    expect(member.plan).toEqual({ id: 'standard', name: 'Standard' });
  });
});
