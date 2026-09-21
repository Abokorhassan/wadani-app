import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';

import { StorageKey, syncStorage } from '@/lib/storage';

import { asApiError, isApiError } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: (failureCount, error) => {
        // Only connection problems are worth retrying; a 4xx will not change.
        if (!isApiError(error)) return false;
        return asApiError(error).kind === 'network' && failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});

export const queryPersister = createSyncStoragePersister({
  storage: syncStorage,
  key: StorageKey.queryCache,
});

/**
 * Only the membership card is kept on disk, so it opens without a connection
 * (build-plan D15). Everything else refetches.
 */
export const persistOptions = {
  persister: queryPersister,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  dehydrateOptions: {
    shouldDehydrateQuery: ({ queryKey }: { queryKey: readonly unknown[] }) => queryKey[0] === 'card',
  },
};
