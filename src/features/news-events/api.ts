import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';

import { toNewsItem, toPartyEvent } from './mappers';
import { eventsResponse, newsResponse } from './schemas';
import type { NewsItem, PartyEvent } from './types';

/** No RSVP endpoint exists; the party isn't supporting it for now (docs/api-gaps.md, question 2). */
export const newsEventsApi = {
  async getNews(): Promise<NewsItem[]> {
    const data = await request('/mobile/news', {
      authenticated: false,
      query: { page: 1, pageSize: 50 },
    });
    return parseResponse(newsResponse, data, 'GET /mobile/news').news.map(toNewsItem);
  },

  async getEvents(): Promise<PartyEvent[]> {
    const data = await request('/mobile/events', { authenticated: false });
    return parseResponse(eventsResponse, data, 'GET /mobile/events').events.map(toPartyEvent);
  },
};

export type NewsEventsApi = typeof newsEventsApi;
