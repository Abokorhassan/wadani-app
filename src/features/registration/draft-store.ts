import { create } from 'zustand';

import { StorageKey, storage } from '@/lib/storage';

import { emptyRegistration, type RegistrationForm } from './form';

/**
 * How long an unfinished registration is kept. The draft holds a person's name,
 * phone, address and the wallet number they pay from, on a phone that may be
 * shared, so it is a convenience for an interrupted sign-up, not something to
 * keep indefinitely.
 */
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

/** Saved between app launches, minus the password (build-plan D12). */
export type RegistrationDraft = Omit<RegistrationForm, 'password'> & {
  step: number;
  /** Epoch milliseconds; drafts written before this field existed have none. */
  savedAt?: number;
};

interface DraftState {
  draft: RegistrationDraft | null;
  save: (values: RegistrationForm, step: number) => void;
  clear: () => void;
}

/** An expired or unreadable draft is deleted, not just ignored. */
export function readDraft(now: number = Date.now()): RegistrationDraft | null {
  const raw = storage.getString(StorageKey.registrationDraft);
  if (!raw) return null;

  try {
    const draft = JSON.parse(raw) as RegistrationDraft;
    // A draft with no timestamp predates the expiry, so it counts as expired.
    if (typeof draft.savedAt === 'number' && now - draft.savedAt < DRAFT_TTL_MS) return draft;
  } catch {
    // fall through and delete it
  }

  storage.remove(StorageKey.registrationDraft);
  return null;
}

export const useDraftStore = create<DraftState>((set) => ({
  draft: readDraft(),

  save: (values, step) => {
    // The password is never written to disk.
    const { password: _password, ...rest } = values;
    const draft: RegistrationDraft = { ...rest, step, savedAt: Date.now() };
    storage.set(StorageKey.registrationDraft, JSON.stringify(draft));
    set({ draft });
  },

  clear: () => {
    storage.remove(StorageKey.registrationDraft);
    set({ draft: null });
  },
}));

/** Draft values merged over the blank form, ready for the form's defaults. */
export function draftDefaults(draft: RegistrationDraft | null): RegistrationForm {
  if (!draft) return emptyRegistration;
  const { step: _step, savedAt: _savedAt, ...values } = draft;
  return { ...emptyRegistration, ...values, password: '' };
}
