import { mockRespond } from '@/api/mock/latency';

import type { NotificationsApi } from './api';
import { toNotification } from './mappers';
import type { NotificationDto } from './schemas';

/** Sample notifications from the prototype. */
export const notificationFixtures: NotificationDto[] = [
  {
    id: 'n-3',
    type: 'approved',
    title: 'Membership approved',
    body: 'Your Waddani membership has been approved. Your digital card is ready.',
    channels: ['whatsapp', 'email'],
    sentAt: '2026-09-13T09:00:00.000Z',
  },
  {
    id: 'n-2',
    type: 'payment',
    title: 'Payment received',
    body: 'We received your payment of $25.00 (Zaad, ref TX-102938).',
    channels: ['whatsapp', 'email'],
    sentAt: '2026-09-12T15:00:00.000Z',
  },
  {
    id: 'n-1',
    type: 'review',
    title: 'Application under review',
    body: 'Thanks for registering. Our team is reviewing your details and payment.',
    channels: ['whatsapp', 'email'],
    sentAt: '2026-09-12T09:00:00.000Z',
  },
];

export const notificationsApiMock: NotificationsApi = {
  getNotifications: () => mockRespond(notificationFixtures.map(toNotification)),
};
