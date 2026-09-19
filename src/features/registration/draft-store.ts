import { create } from 'zustand';

import { StorageKey, storage } from '@/lib/storage';

import { emptyRegistration, type RegistrationForm } from './form';

/** Saved between app launches, minus the password (build-plan D12). */
export type RegistrationDraft = Omit<RegistrationForm, 'password'> & { step: number };

interface DraftState {
  draft: RegistrationDraft | null;
  save: (values: RegistrationForm, step: number) => void;
  clear: () => void;
}

function read(): RegistrationDraft | null {
  const raw = storage.getString(StorageKey.registrationDraft);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RegistrationDraft;
  } catch {
    return null;
  }
}

export const useDraftStore = create<DraftState>((set) => ({
  draft: read(),

  save: (values, step) => {
    // The password is never written to disk.
    const { password: _password, ...rest } = values;
    const draft: RegistrationDraft = { ...rest, step };
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
  const { step: _step, ...values } = draft;
  return { ...emptyRegistration, ...values, password: '' };
}
