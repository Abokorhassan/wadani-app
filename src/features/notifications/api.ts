import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';

import { toNotification } from './mappers';
import { notificationsResponse } from './schemas';
import type { Notification } from './types';

/** Live endpoints. Paths are placeholders until the Postman collection lands. */
export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    const data = await request('/me/notifications');
    return parseResponse(notificationsResponse, data, 'GET /me/notifications').map(toNotification);
  },
};

export type NotificationsApi = typeof notificationsApi;
