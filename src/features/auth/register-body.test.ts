import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { request } from '@/api/client';
import type { ChargeMethod } from '@/features/payments/types';

import { authApi } from './api';
import type { RegistrationPayload } from './types';

jest.mock('@/api/client', () => ({ request: jest.fn() }));

const requestMock = request as jest.Mock;

/** POST /mobile/auth/register's request schema, read from the saved spec. */
const spec = JSON.parse(
  readFileSync(join(__dirname, '../../../api-contract/waddani-mobile-api.openapi.json'), 'utf8')
).paths['/mobile/auth/register'].post.requestBody.content['application/json'].schema as {
  required: string[];
  properties: Record<string, unknown>;
};

const payload = (method: ChargeMethod): RegistrationPayload => ({
  fullName: 'Mobile Tester',
  gender: 'male',
  phone: '+252611111111',
  email: 'mobile.tester@example.com',
  photoUrl: 'https://example.com/photo.jpg',
  education: 'bachelor',
  professionalWork: 'Engineer',
  birthYear: 1995,
  membershipTypeId: '00000000-0000-0000-0000-000000000000',
  membershipPeriodId: '00000000-0000-0000-0000-000000000000',
  address: {
    line1: '123 Main St',
    city: 'Hargeisa',
    region: 'Woqooyi Galbeed',
    country: 'Somaliland',
  },
  password: 'SuperSecret123',
  charge: { method, amountUsd: 24, payerPhone: '+252611111111' },
});

async function bodyFor(method: ChargeMethod): Promise<Record<string, unknown>> {
  requestMock.mockResolvedValue({ checkoutId: 'c', checkoutUrl: 'https://pay.example/c' });
  await authApi.register(payload(method));
  return (requestMock.mock.calls.at(-1)?.[1] as { body: Record<string, unknown> }).body;
}

describe('POST /mobile/auth/register body', () => {
  it.each(['WAAFI', 'EDAHAB', 'PREMIER_WALLET', 'CARD'] as const)(
    'for %s sends every required field, and nothing the spec does not know',
    async (method) => {
      const body = await bodyFor(method);

      for (const field of spec.required) expect(body).toHaveProperty(field);
      for (const field of Object.keys(body)) expect(spec.properties).toHaveProperty(field);
      expect(body.method).toBe(method);
    }
  );

  it("matches the spec's own example for a wallet payment", async () => {
    expect(await bodyFor('WAAFI')).toEqual({
      fullName: 'Mobile Tester',
      gender: 'MALE',
      phone: '+252611111111',
      email: 'mobile.tester@example.com',
      photoUrl: 'https://example.com/photo.jpg',
      educationalLevel: 'BACHELOR',
      professionalWork: 'Engineer',
      birthYear: 1995,
      membershipTypeId: '00000000-0000-0000-0000-000000000000',
      membershipPeriodId: '00000000-0000-0000-0000-000000000000',
      address: {
        line1: '123 Main St',
        city: 'Hargeisa',
        region: 'Woqooyi Galbeed',
        country: 'Somaliland',
      },
      password: 'SuperSecret123',
      payerPhone: '+252611111111',
      amount: '24.00',
      method: 'WAAFI',
    });
  });

  it.each(['EDAHAB', 'PREMIER_WALLET'] as const)(
    'differs from the wallet example only in `method` for %s',
    async (method) => {
      const wallet = await bodyFor('WAAFI');
      expect(await bodyFor(method)).toEqual({ ...wallet, method });
    }
  );

  it('sends a card payment with a return address and no wallet number', async () => {
    const body = await bodyFor('CARD');
    expect(body.payerPhone).toBeUndefined();
    expect(body.returnUrl).toBe('https://wp-membership-system.com/pay/return');
    expect(body.amount).toBe('24.00');
  });
});
