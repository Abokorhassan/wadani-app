import { create } from 'zustand';

import { configureClient } from '@/api/client';
import { queryClient } from '@/api/query-client';
import type { MemberSummary } from '@/features/membership/types';
import { deleteSecure, getSecure, SecureKey, setSecure } from '@/lib/secure-storage';
import { storage } from '@/lib/storage';

const MEMBER_SUMMARY_KEY = 'session-member';

export type SessionStatus = 'restoring' | 'signed-out' | 'signed-in';

interface SessionState {
  status: SessionStatus;
  accessToken: string | null;
  member: MemberSummary | null;
  /** Reads the saved session on launch. */
  restore: () => Promise<void>;
  signIn: (params: {
    accessToken: string;
    refreshToken?: string;
    member: MemberSummary;
  }) => Promise<void>;
  setMember: (member: MemberSummary) => void;
  signOut: () => Promise<void>;
}

function readMemberSummary(): MemberSummary | null {
  const raw = storage.getString(MEMBER_SUMMARY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MemberSummary;
  } catch {
    return null;
  }
}

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'restoring',
  accessToken: null,
  member: null,

  restore: async () => {
    const accessToken = await getSecure(SecureKey.accessToken);
    const member = readMemberSummary();

    // Phase 1 replaces the cached summary with a `GET /me` call, which is also
    // what decides pending / rejected routing (build-plan D2).
    if (accessToken && member) {
      set({ status: 'signed-in', accessToken, member });
    } else {
      set({ status: 'signed-out', accessToken: null, member: null });
    }
  },

  signIn: async ({ accessToken, refreshToken, member }) => {
    await setSecure(SecureKey.accessToken, accessToken);
    if (refreshToken) await setSecure(SecureKey.refreshToken, refreshToken);
    storage.set(MEMBER_SUMMARY_KEY, JSON.stringify(member));
    set({ status: 'signed-in', accessToken, member });
  },

  setMember: (member) => {
    storage.set(MEMBER_SUMMARY_KEY, JSON.stringify(member));
    set({ member });
  },

  signOut: async () => {
    await deleteSecure(SecureKey.accessToken);
    await deleteSecure(SecureKey.refreshToken);
    storage.remove(MEMBER_SUMMARY_KEY);
    queryClient.clear();
    set({ status: 'signed-out', accessToken: null, member: null });
  },
}));

// The API client stays free of feature imports; the session pushes into it.
configureClient({
  getToken: () => useSessionStore.getState().accessToken,
  onUnauthorized: () => {
    void useSessionStore.getState().signOut();
  },
});

export const selectIsSignedIn = (state: SessionState): boolean => state.status === 'signed-in';
