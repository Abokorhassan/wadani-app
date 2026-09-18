import type { NotificationDto } from './schemas';
import type { Notification, NotificationChannel, NotificationType } from './types';

const TYPES: NotificationType[] = ['review', 'payment', 'approved'];
const CHANNELS: NotificationChannel[] = ['whatsapp', 'email'];

export function toNotification(dto: NotificationDto): Notification {
  const type = dto.type.toLowerCase() as NotificationType;
  return {
    id: dto.id,
    type: TYPES.includes(type) ? type : 'other',
    title: dto.title,
    body: dto.body,
    channels: dto.channels
      .map((channel) => channel.toLowerCase() as NotificationChannel)
      .filter((channel) => CHANNELS.includes(channel)),
    sentAt: dto.sentAt,
  };
}
