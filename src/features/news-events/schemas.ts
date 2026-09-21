import { z } from 'zod';

/** Backend shapes, from api-contract/waddani-mobile-api.openapi.json. */
export const newsItemDto = z.object({
  id: z.string(),
  title: z.string(),
  /** Rich text (HTML) written in the admin portal's editor. */
  body: z.string(),
  imageUrl: z.string().nullish(),
  publishedAt: z.string(),
});

export const eventDto = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  location: z.string().nullish(),
  startsAt: z.string(),
  endsAt: z.string().nullish(),
});

export const newsResponse = z.object({
  news: z.array(newsItemDto),
  total: z.number().int().nullish(),
  page: z.number().int().nullish(),
  pageSize: z.number().int().nullish(),
});

export const eventsResponse = z.object({ events: z.array(eventDto) });

export type NewsItemDto = z.infer<typeof newsItemDto>;
export type EventDto = z.infer<typeof eventDto>;
