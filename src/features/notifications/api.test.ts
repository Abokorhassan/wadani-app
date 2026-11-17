import { request } from '@/api/client';

import { notificationsApi } from './api';

jest.mock('@/api/client', () => ({ request: jest.fn() }));

const requestMock = request as jest.Mock;

describe('notifications API', () => {
  it('loads the newest page of the inbox with its unread count', async () => {
    requestMock.mockResolvedValue({ notifications: [], unreadCount: 3, total: 0 });
    expect(await notificationsApi.getInbox()).toEqual({ notifications: [], unreadCount: 3 });
    expect(requestMock).toHaveBeenLastCalledWith('/mobile/notifications', {
      query: { page: 1, pageSize: 100 },
    });
  });

  it('reads the unread count on its own', async () => {
    requestMock.mockResolvedValue({ unreadCount: 5 });
    expect(await notificationsApi.getUnreadCount()).toBe(5);
    expect(requestMock).toHaveBeenLastCalledWith('/mobile/notifications/unread-count');
  });

  it('marks one, or all, as read', async () => {
    requestMock.mockResolvedValue(null); // 204
    await notificationsApi.markRead('7f1c2a7e-0000-4000-8000-000000000001');
    expect(requestMock).toHaveBeenLastCalledWith(
      '/mobile/notifications/7f1c2a7e-0000-4000-8000-000000000001/read',
      { method: 'POST' }
    );
    await notificationsApi.markAllRead();
    expect(requestMock).toHaveBeenLastCalledWith('/mobile/notifications/read-all', {
      method: 'POST',
    });
  });
});
