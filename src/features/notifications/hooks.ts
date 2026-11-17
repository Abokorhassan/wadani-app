import { useMutation, useQuery } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';
import { queryClient } from '@/api/query-client';
import { useSessionStore } from '@/features/auth/session-store';

import { notificationsApi } from './api';
import { notificationsApiMock } from './api.mock';
import { allMarkedRead, markedRead } from './mappers';
import type { NotificationInbox } from './types';

const api = pickApi('notifications', notificationsApi, notificationsApiMock);

export const notificationsKeys = {
  inbox: ['notifications'] as const,
  unread: ['notifications', 'unread'] as const,
};

/** How often Home's bell asks for the count while the app is open. */
const UNREAD_POLL_MS = 60_000;

export function useNotifications() {
  return useQuery({
    queryKey: notificationsKeys.inbox,
    queryFn: async () => {
      const inbox = await api.getInbox();
      // The list carries the count too, so the bell agrees with it at once.
      queryClient.setQueryData(notificationsKeys.unread, inbox.unreadCount);
      return inbox;
    },
  });
}

/** The number on Home's bell. Also refreshed whenever the inbox is loaded. */
export function useUnreadCount() {
  const signedIn = useSessionStore((state) => state.status === 'signed-in');
  return useQuery({
    queryKey: notificationsKeys.unread,
    queryFn: () => api.getUnreadCount(),
    enabled: signedIn,
    refetchInterval: UNREAD_POLL_MS,
  });
}

/** Writes an inbox change to both the list and the bell's count at once. */
function updateInbox(change: (inbox: NotificationInbox) => NotificationInbox) {
  const inbox = queryClient.getQueryData<NotificationInbox>(notificationsKeys.inbox);
  if (!inbox) return;
  const next = change(inbox);
  queryClient.setQueryData(notificationsKeys.inbox, next);
  queryClient.setQueryData(notificationsKeys.unread, next.unreadCount);
}

/**
 * Marks one notification read. The screen updates straight away; if the server
 * refuses, the next load shows the truth again.
 */
export function useMarkRead() {
  return useMutation({
    mutationFn: (id: string) => api.markRead(id),
    onMutate: (id) => updateInbox((inbox) => markedRead(inbox, id)),
    onError: () => void queryClient.invalidateQueries({ queryKey: notificationsKeys.inbox }),
  });
}

export function useMarkAllRead() {
  return useMutation({
    mutationFn: () => api.markAllRead(),
    onMutate: () => updateInbox(allMarkedRead),
    onError: () => void queryClient.invalidateQueries({ queryKey: notificationsKeys.inbox }),
  });
}
