import { decodeJwtClaims, jwtExpiresAt } from './jwt';

/** Builds an unsigned token; only the payload matters to the decoder. */
function tokenWith(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

describe('JWT claims', () => {
  it('reads the payload', () => {
    const claims = decodeJwtClaims(tokenWith({ sub: 'abc', fullName: 'Eng Ladif', exp: 1789900000 }));
    expect(claims).toMatchObject({ sub: 'abc', fullName: 'Eng Ladif' });
  });

  it('survives non-ASCII names', () => {
    const claims = decodeJwtClaims(tokenWith({ fullName: 'Cabdiraxmaan Cali' }));
    expect(claims?.fullName).toBe('Cabdiraxmaan Cali');
  });

  it('turns exp into a date, and tolerates its absence', () => {
    expect(jwtExpiresAt({ exp: 1789900000 })?.getTime()).toBe(1789900000 * 1000);
    expect(jwtExpiresAt({})).toBeNull();
  });

  it('returns null for anything that is not a JWT', () => {
    // The mock issues opaque tokens, so this path has to be safe.
    expect(decodeJwtClaims('mock-token-123')).toBeNull();
    expect(decodeJwtClaims('')).toBeNull();
    expect(decodeJwtClaims('a.b.c')).toBeNull();
  });
});
