import { z } from 'zod';

/** GET /mobile/notifications (platform/docs/Mobile_Notifications_API.pdf). */
export const notificationDto = z.object({
  id: z.string(),
  /** NEWS, EVENT, PAYMENT or DONATION today; free-form on the server. */
  type: z.string(),
  title: z.string(),
  body: z.string(),
  entityId: z.string().nullish(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const notificationsResponse = z.object({
  notifications: z.array(notificationDto),
  unreadCount: z.number().int(),
});

/** GET /mobile/notifications/unread-count. */
export const unreadCountResponse = z.object({ unreadCount: z.number().int() });

export type NotificationDto = z.infer<typeof notificationDto>;
