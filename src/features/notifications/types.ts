export type NotificationType = 'review' | 'payment' | 'approved' | 'other';

export type NotificationChannel = 'whatsapp' | 'email';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  channels: NotificationChannel[];
  /** ISO date. */
  sentAt: string;
}
