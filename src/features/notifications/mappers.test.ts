import { notificationFixtures } from './api.mock';
import { allMarkedRead, markedRead, notificationDestination, toNotification } from './mappers';
import { notificationsResponse } from './schemas';

describe('notification mappers', () => {
  it('reads the backend shape, and calls an unknown type "other"', () => {
    const payment = toNotification(notificationFixtures[3]);
    expect(payment).toMatchObject({ type: 'payment', read: true, title: 'Payment received' });
    expect(toNotification({ ...notificationFixtures[0], type: 'ELECTION' }).type).toBe('other');
    expect(toNotification({ ...notificationFixtures[0], entityId: null }).entityId).toBeUndefined();
  });

  it('parses a page exactly as the API sends it', () => {
    const page = {
      notifications: [
        {
          id: '7f1c2a7e-0000-4000-8000-000000000001',
          type: 'NEWS',
          title: 'Party congress announced',
          body: 'The party congress will take place in Hargeisa…',
          entityId: '3b0b2a91-0000-4000-8000-000000000002',
          isRead: false,
          createdAt: '2026-11-02T10:15:00.000Z',
        },
      ],
      unreadCount: 1,
      total: 1,
      page: 1,
      pageSize: 100,
    };
    expect(notificationsResponse.safeParse(page).success).toBe(true);
  });

  it('opens news and events on their tab, and payments and donations in Payments', () => {
    expect(notificationDestination('news')).toBe('news');
    expect(notificationDestination('event')).toBe('events');
    expect(notificationDestination('payment')).toBe('payments');
    expect(notificationDestination('donation')).toBe('payments');
    expect(notificationDestination('other')).toBeNull();
  });

  it('keeps the unread count right when marking read, once only', () => {
    const inbox = { notifications: notificationFixtures.map(toNotification), unreadCount: 2 };
    const once = markedRead(inbox, 'n-4');
    expect(once.unreadCount).toBe(1);
    expect(once.notifications.find((item) => item.id === 'n-4')?.read).toBe(true);
    // Already read, or unknown: nothing changes.
    expect(markedRead(once, 'n-4')).toBe(once);
    expect(markedRead(once, 'nope')).toBe(once);

    const all = allMarkedRead(inbox);
    expect(all.unreadCount).toBe(0);
    expect(all.notifications.every((item) => item.read)).toBe(true);
  });
});
