import { createMMKV } from 'react-native-mmkv';

/** Fast local storage for cache and drafts. Never for tokens: see secure-storage.ts */
export const storage = createMMKV({ id: 'waddani' });

/** Sync storage adapter, as expected by TanStack Query's persister and Zustand. */
export const syncStorage = {
  getItem: (key: string): string | null => storage.getString(key) ?? null,
  setItem: (key: string, value: string): void => storage.set(key, value),
  removeItem: (key: string): void => {
    storage.remove(key);
  },
};

export const StorageKey = {
  queryCache: 'query-cache',
  registrationDraft: 'registration-draft',
  language: 'language',
} as const;
