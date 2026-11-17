import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';

import { toNotification } from './mappers';
import { notificationsResponse, unreadCountResponse } from './schemas';
import type { NotificationInbox } from './types';

/**
 * The newest notifications, as many as the API gives in one page. Older ones
 * are not shown; an inbox that long can gain paging later.
 */
const PAGE_SIZE = 100;

export const notificationsApi = {
  /** The member's own notifications plus party news and event broadcasts. */
  async getInbox(): Promise<NotificationInbox> {
    const data = await request('/mobile/notifications', {
      query: { page: 1, pageSize: PAGE_SIZE },
    });
    const parsed = parseResponse(notificationsResponse, data, 'GET /mobile/notifications');
    return {
      notifications: parsed.notifications.map(toNotification),
      unreadCount: parsed.unreadCount,
    };
  },

  /** Cheap enough to poll, for the bell on Home. */
  async getUnreadCount(): Promise<number> {
    const data = await request('/mobile/notifications/unread-count');
    return parseResponse(unreadCountResponse, data, 'GET /mobile/notifications/unread-count')
      .unreadCount;
  },

  async markRead(id: string): Promise<void> {
    await request(`/mobile/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' });
  },

  async markAllRead(): Promise<void> {
    await request('/mobile/notifications/read-all', { method: 'POST' });
  },
};

export type NotificationsApi = typeof notificationsApi;
