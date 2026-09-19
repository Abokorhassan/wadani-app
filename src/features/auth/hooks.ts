import { useMutation } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';
import { queryClient } from '@/api/query-client';
import { membershipKeys } from '@/features/membership/hooks';

import { authApi } from './api';
import { authApiMock } from './api.mock';
import { useSessionStore } from './session-store';
import type { AuthSession, Credentials, RegistrationPayload } from './types';

const api = pickApi('auth', authApi, authApiMock);

/** Stores the session and seeds the member cache, so Home has data at once. */
async function adoptSession(session: AuthSession) {
  await useSessionStore.getState().signIn({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    member: {
      id: session.member.id,
      fullName: session.member.fullName,
      status: session.member.status,
    },
  });
  queryClient.setQueryData(membershipKeys.me, session.member);
}

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: Credentials) => api.login(credentials),
    onSuccess: adoptSession,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegistrationPayload) => api.register(payload),
    onSuccess: adoptSession,
  });
}
