import { mockRespond } from '@/api/mock/latency';

import type { NotificationsApi } from './api';
import { toNotification } from './mappers';
import type { NotificationDto } from './schemas';

/** One of each kind the backend sends, worded as it words them; two unread. */
export const notificationFixtures: NotificationDto[] = [
  {
    id: 'n-4',
    type: 'EVENT',
    title: 'New event: Hargeisa members meeting',
    body: 'Sat 4 Oct, 10:00 · Party office, Hargeisa',
    entityId: 'e-1',
    isRead: false,
    createdAt: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'n-3',
    type: 'NEWS',
    title: 'Waddani opens three new district offices',
    body: 'Members in Burco, Boorama and Ceerigaabo can now register and renew in person.',
    entityId: 'news-1',
    isRead: false,
    createdAt: '2026-09-20T09:00:00.000Z',
  },
  {
    id: 'n-2',
    type: 'DONATION',
    title: 'Thank you for your donation',
    body: 'Your donation of 10.00 USD via WAAFI was received. Ref: TX-554120',
    entityId: 'd-1',
    isRead: true,
    createdAt: '2026-09-15T15:00:00.000Z',
  },
  {
    id: 'n-1',
    type: 'PAYMENT',
    title: 'Payment received',
    body: 'Your payment of 25.00 USD via WAAFI was received. Ref: TX-102938',
    entityId: 'aaaa1111-0000-0000-0000-000000000002',
    isRead: true,
    createdAt: '2026-09-12T15:00:00.000Z',
  },
];

/** Read state, kept while the app runs, so marking as read sticks. */
const read = new Set(notificationFixtures.filter((dto) => dto.isRead).map((dto) => dto.id));

const unread = () => notificationFixtures.filter((dto) => !read.has(dto.id)).length;

export const notificationsApiMock: NotificationsApi = {
  getInbox: () =>
    mockRespond({
      notifications: notificationFixtures.map((dto) =>
        toNotification({ ...dto, isRead: read.has(dto.id) })
      ),
      unreadCount: unread(),
    }),
  getUnreadCount: () => mockRespond(unread(), 200),
  markRead: async (id) => {
    read.add(id);
    await mockRespond(undefined, 200);
  },
  markAllRead: async () => {
    for (const dto of notificationFixtures) read.add(dto.id);
    await mockRespond(undefined, 300);
  },
};
