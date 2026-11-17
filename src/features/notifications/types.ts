/** What the notification is about. Anything new from the server is "other". */
export type NotificationType = 'news' | 'event' | 'payment' | 'donation' | 'other';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** The news article, event, payment or donation it is about. */
  entityId?: string;
  read: boolean;
  /** ISO date. */
  createdAt: string;
}

export interface NotificationInbox {
  notifications: Notification[];
  unreadCount: number;
}

/** Where tapping a notification takes the member. */
export type NotificationDestination = 'news' | 'events' | 'payments' | null;
