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

describe('password reset', () => {
  it('asks for a code with the phone in international form', async () => {
    requestMock.mockResolvedValue({ message: 'ok' });
    await authApi.requestPasswordReset('63 234 5678');
    expect(requestMock).toHaveBeenLastCalledWith('/mobile/auth/password/forgot', {
      method: 'POST',
      body: { identifier: '+252632345678' },
      authenticated: false,
    });
  });

  it('sends the code and new password in the shape the API expects', async () => {
    requestMock.mockResolvedValue({ message: 'ok' });
    await authApi.resetPassword({
      identifier: ' amina@example.com ',
      otp: '042917',
      newPassword: 'new-secret-123',
    });
    expect(requestMock).toHaveBeenLastCalledWith('/mobile/auth/password/reset', {
      method: 'POST',
      body: { identifier: 'amina@example.com', otp: '042917', newPassword: 'new-secret-123' },
      authenticated: false,
    });
  });
});

describe('temporary password (staff-registered members)', () => {
  it('reports mustChangePassword from login, and false when the server leaves it out', async () => {
    requestMock.mockResolvedValue({
      accessToken: 'a.b.c',
      memberId: 'm1',
      mustChangePassword: true,
    });
    expect(
      (await authApi.login({ identifier: 'a@b.co', password: 'Temp1234' })).mustChangePassword
    ).toBe(true);

    requestMock.mockResolvedValue({ accessToken: 'a.b.c', memberId: 'm1' });
    expect((await authApi.login({ identifier: 'a@b.co', password: 'x' })).mustChangePassword).toBe(
      false
    );
  });

  it('changes the password as the signed-in member', async () => {
    requestMock.mockResolvedValue({ message: 'Password changed' });
    await authApi.changePassword({ currentPassword: 'Temp1234', newPassword: 'NewPassw0rd!' });
    // Signed in: no `authenticated: false`, so the token is sent.
    expect(requestMock).toHaveBeenLastCalledWith('/mobile/auth/password/change', {
      method: 'POST',
      body: { currentPassword: 'Temp1234', newPassword: 'NewPassw0rd!' },
    });
  });
});

describe('account deletion', () => {
  it('deletes the signed-in member with the password re-entered', async () => {
    requestMock.mockResolvedValue(null);
    await authApi.deleteAccount({ password: 'secret12345' });
    expect(requestMock).toHaveBeenLastCalledWith('/mobile/auth/me', {
      method: 'DELETE',
      body: { password: 'secret12345' },
    });
  });
});
