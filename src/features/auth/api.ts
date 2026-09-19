import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';
import { toMember } from '@/features/membership/mappers';

import { authResponse } from './schemas';
import type { AuthSession, Credentials, RegistrationPayload } from './types';

function toSession(data: unknown, context: string): AuthSession {
  const parsed = parseResponse(authResponse, data, context);
  return {
    accessToken: parsed.accessToken,
    refreshToken: parsed.refreshToken ?? undefined,
    member: toMember(parsed.member),
  };
}

/** Live endpoints. Paths are placeholders until the Postman collection lands. */
export const authApi = {
  async login(credentials: Credentials): Promise<AuthSession> {
    const data = await request('/auth/login', {
      method: 'POST',
      body: credentials,
      authenticated: false,
    });
    return toSession(data, 'POST /auth/login');
  },

  /**
   * The member is created with status `pending`; the office reviews the
   * details and the payment before the card is issued.
   */
  async register(payload: RegistrationPayload): Promise<AuthSession> {
    const data = await request('/auth/register', {
      method: 'POST',
      body: payload,
      authenticated: false,
    });
    return toSession(data, 'POST /auth/register');
  },

  async logout(): Promise<void> {
    await request('/auth/logout', { method: 'POST' });
  },
};

export type AuthApi = typeof authApi;
