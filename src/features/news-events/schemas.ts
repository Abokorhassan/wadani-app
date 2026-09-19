import { z } from 'zod';

/** Backend shapes; rewritten from the Postman collection when it lands (build-plan §4.6). */
export const newsItemDto = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  publishedAt: z.string(),
});

export const eventDto = z.object({
  id: z.string(),
  title: z.string(),
  startsAt: z.string(),
  venue: z.string(),
  isGoing: z.boolean().nullish(),
});

export const newsResponse = z.array(newsItemDto);
export const eventsResponse = z.array(eventDto);

export type NewsItemDto = z.infer<typeof newsItemDto>;
export type EventDto = z.infer<typeof eventDto>;
