import { create } from 'zustand';

import { configureClient } from '@/api/client';
import { queryClient } from '@/api/query-client';
import type { Member } from '@/features/membership/types';
// Data-layer to data-layer, so no screen code is pulled in (AGENTS.md).
import { useDraftStore } from '@/features/registration/draft-store';
import { deleteSecure, getSecure, SecureKey, setSecure } from '@/lib/secure-storage';
import { storage } from '@/lib/storage';

const MEMBER_KEY = 'session-member';
const MEMBER_ID_KEY = 'session-member-id';

export type SessionStatus = 'restoring' | 'signed-out' | 'signed-in';

interface SessionState {
  status: SessionStatus;
  accessToken: string | null;
  memberId: string | null;
  /**
   * The full record, when we have it. Registration is the only call that
   * returns it, so this is null for a member who signed in on another device
   * (docs/api-gaps.md, question 5).
   */
  member: Member | null;
  /** Reads the saved session on launch. */
  restore: () => Promise<void>;
  signIn: (params: { accessToken: string; memberId: string; member?: Member }) => Promise<void>;
  setMember: (member: Member) => void;
  signOut: () => Promise<void>;
}

function readMember(): Member | null {
  const raw = storage.getString(MEMBER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Member;
  } catch {
    return null;
  }
}

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'restoring',
  accessToken: null,
  memberId: null,
  member: null,

  restore: async () => {
    const accessToken = await getSecure(SecureKey.accessToken);
    const memberId = storage.getString(MEMBER_ID_KEY) ?? null;

    if (accessToken && memberId) {
      set({ status: 'signed-in', accessToken, memberId, member: readMember() });
    } else {
      set({ status: 'signed-out', accessToken: null, memberId: null, member: null });
    }
  },

  signIn: async ({ accessToken, memberId, member }) => {
    await setSecure(SecureKey.accessToken, accessToken);
    storage.set(MEMBER_ID_KEY, memberId);
    // Keep an earlier profile if this sign-in did not bring one.
    const kept = member ?? (get().memberId === memberId ? get().member : null) ?? readMember();
    const next = kept && kept.id === memberId ? kept : (member ?? null);
    if (next) storage.set(MEMBER_KEY, JSON.stringify(next));
    set({ status: 'signed-in', accessToken, memberId, member: next });
  },

  setMember: (member) => {
    storage.set(MEMBER_KEY, JSON.stringify(member));
    set({ member });
  },

  signOut: async () => {
    await deleteSecure(SecureKey.accessToken);
    await deleteSecure(SecureKey.refreshToken);
    storage.remove(MEMBER_KEY);
    storage.remove(MEMBER_ID_KEY);
    // The next person to use this phone must not see this one's half-finished form.
    useDraftStore.getState().clear();
    queryClient.clear();
    set({ status: 'signed-out', accessToken: null, memberId: null, member: null });
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
