import { asApiError } from '@/api/errors';

import { authApiMock, DEMO_PASSWORD } from './api.mock';

jest.mock('@/api/mock/latency', () => ({
  mockRespond: (value: unknown) => Promise.resolve(value),
}));

const demo = { identifier: 'moshibbin@gmail.com', password: DEMO_PASSWORD };

describe('mock account deletion', () => {
  it('refuses a wrong password, the way the screen expects', async () => {
    await authApiMock.login(demo);
    const failure = await authApiMock.deleteAccount({ password: 'nope' }).catch((e) => e);
    expect(asApiError(failure)).toMatchObject({ kind: 'validation', code: 'WRONG_PASSWORD' });
  });

  it('deletes the account, so it can no longer sign in', async () => {
    await authApiMock.login(demo);
    await authApiMock.deleteAccount({ password: DEMO_PASSWORD });
    await expect(authApiMock.login(demo)).rejects.toBeDefined();
  });
});
