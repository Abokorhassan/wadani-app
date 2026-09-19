import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';

import { toNewsItem, toPartyEvent } from './mappers';
import { eventsResponse, newsResponse } from './schemas';
import type { NewsItem, PartyEvent } from './types';

/** Live endpoints. Paths are placeholders until the Postman collection lands. */
export const newsEventsApi = {
  async getNews(): Promise<NewsItem[]> {
    const data = await request('/news');
    return parseResponse(newsResponse, data, 'GET /news').map(toNewsItem);
  },

  async getEvents(): Promise<PartyEvent[]> {
    const data = await request('/events');
    return parseResponse(eventsResponse, data, 'GET /events').map(toPartyEvent);
  },

  /** RSVP to an event, or take it back. */
  async setRsvp(eventId: string, going: boolean): Promise<void> {
    await request(`/events/${eventId}/rsvp`, { method: going ? 'POST' : 'DELETE' });
  },
};

export type NewsEventsApi = typeof newsEventsApi;
