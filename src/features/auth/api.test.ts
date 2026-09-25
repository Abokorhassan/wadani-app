import { request } from '@/api/client';

import { authApi } from './api';

jest.mock('@/api/client', () => ({ request: jest.fn() }));

const requestMock = request as jest.Mock;

// login() reports the token's claims in development; that is noise here.
beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

async function identifierSentFor(typed: string) {
  requestMock.mockResolvedValue({ accessToken: 'a.b.c', memberId: 'm1' });
  await authApi.login({ identifier: typed, password: 'secret12345' });
  return (requestMock.mock.calls.at(-1)?.[1] as { body: { identifier: string } }).body.identifier;
}

describe('login identifier', () => {
  it('turns a phone as people write it into the stored international form', async () => {
    expect(await identifierSentFor('63 234 5678')).toBe('+252632345678');
    expect(await identifierSentFor('0632345678')).toBe('+252632345678');
  });

  it('leaves an email alone', async () => {
    expect(await identifierSentFor('  Amina@Example.com ')).toBe('Amina@Example.com');
  });

  it('passes through anything that is not a phone, for the server to refuse', async () => {
    expect(await identifierSentFor('12345')).toBe('12345');
  });
});
