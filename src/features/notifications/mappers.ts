import type { NotificationDto } from './schemas';
import type { Notification, NotificationDestination, NotificationType } from './types';

const TYPES: Record<string, NotificationType> = {
  NEWS: 'news',
  EVENT: 'event',
  PAYMENT: 'payment',
  DONATION: 'donation',
};

export function toNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    type: TYPES[dto.type.toUpperCase()] ?? 'other',
    title: dto.title,
    body: dto.body,
    entityId: dto.entityId ?? undefined,
    read: dto.isRead,
    createdAt: dto.createdAt,
  };
}

/**
 * The screen a notification opens. News and events have no page of their own
 * yet, so they open the matching tab; donations are listed with payments.
 */
export function notificationDestination(type: NotificationType): NotificationDestination {
  switch (type) {
    case 'news':
      return 'news';
    case 'event':
      return 'events';
    case 'payment':
    case 'donation':
      return 'payments';
    default:
      return null;
  }
}

/** The inbox after one notification is read, for updating the screen at once. */
export function markedRead<T extends { notifications: Notification[]; unreadCount: number }>(
  inbox: T,
  id: string
): T {
  const target = inbox.notifications.find((item) => item.id === id);
  if (!target || target.read) return inbox;
  return {
    ...inbox,
    notifications: inbox.notifications.map((item) =>
      item.id === id ? { ...item, read: true } : item
    ),
    unreadCount: Math.max(0, inbox.unreadCount - 1),
  };
}

/** The inbox after "mark all as read". */
export function allMarkedRead<T extends { notifications: Notification[]; unreadCount: number }>(
  inbox: T
): T {
  return {
    ...inbox,
    notifications: inbox.notifications.map((item) => ({ ...item, read: true })),
    unreadCount: 0,
  };
}
