import { z } from 'zod';

/** Backend shapes; rewritten from the Postman collection when it lands (build-plan §4.6). */
export const notificationDto = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  channels: z.array(z.string()),
  sentAt: z.string(),
});

export const notificationsResponse = z.array(notificationDto);

export type NotificationDto = z.infer<typeof notificationDto>;
