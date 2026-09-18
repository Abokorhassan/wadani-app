import { useQuery } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';

import { notificationsApi } from './api';
import { notificationsApiMock } from './api.mock';

const api = pickApi('notifications', notificationsApi, notificationsApiMock);

export const notificationsKeys = {
  list: ['notifications'] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationsKeys.list,
    queryFn: () => api.getNotifications(),
  });
}
