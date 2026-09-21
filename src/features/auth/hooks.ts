import { useMutation } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';
import { queryClient } from '@/api/query-client';
import { membershipKeys } from '@/features/membership/hooks';
import type { Member, MemberCard } from '@/features/membership/types';

import { authApi } from './api';
import { authApiMock } from './api.mock';
import { useSessionStore } from './session-store';
import type { Credentials, RegistrationPayload, RegistrationResult } from './types';

const api = pickApi('auth', authApi, authApiMock);

/** Stores the session, and the card cache so Home and the card open at once. */
async function adoptSession(params: {
  accessToken: string;
  memberId: string;
  member?: Member;
  card?: MemberCard;
}) {
  await useSessionStore.getState().signIn({
    accessToken: params.accessToken,
    memberId: params.memberId,
    member: params.member,
  });
  if (params.card) queryClient.setQueryData(membershipKeys.card, params.card);
}

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: Credentials) => api.login(credentials),
    onSuccess: (session) => adoptSession(session),
  });
}

/**
 * Registration does not return a token, so a successful one is followed by a
 * login with the same credentials (api-contract/, POST /mobile/auth/register).
 */
export function useRegister() {
  return useMutation<RegistrationResult, Error, RegistrationPayload>({
    mutationFn: async (payload) => {
      const result = await api.register(payload);
      if (result.kind === 'registered') {
        const session = await api.login({
          identifier: payload.phone,
          password: payload.password,
        });
        await adoptSession({ ...session, member: result.member, card: result.card });
      }
      return result;
    },
  });
}

export function usePasswordReset() {
  return useMutation({
    mutationFn: (identifier: string) => api.requestPasswordReset(identifier),
  });
}
