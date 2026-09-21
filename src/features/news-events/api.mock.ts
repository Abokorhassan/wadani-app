import { mockRespond } from '@/api/mock/latency';

import type { NewsEventsApi } from './api';
import { toNewsItem, toPartyEvent } from './mappers';
import type { EventDto, NewsItemDto } from './schemas';

/** Sample content from the prototype. The party supplies the real copy. */
export const newsFixtures: NewsItemDto[] = [
  {
    id: 'news-3',
    title: 'Waddani opens new regional office in Burao',
    body: 'The party continues to expand its presence across Somaliland to better serve members and coordinate community programs.',
    publishedAt: '2026-09-10T08:00:00.000Z',
  },
  {
    id: 'news-2',
    title: 'Annual membership drive begins this month',
    body: 'Invite family and friends to join — every new member strengthens our community.',
    publishedAt: '2026-09-03T08:00:00.000Z',
  },
  {
    id: 'news-1',
    title: "Chairman's statement on national development",
    body: 'Read the full statement on our priorities for education, health and infrastructure.',
    publishedAt: '2026-08-28T08:00:00.000Z',
  },
];

export const eventFixtures: EventDto[] = [
  {
    id: 'event-1',
    title: 'Community town hall — Hargeisa',
    startsAt: '2026-09-21T15:00:00.000Z',
    location: 'Waddani Head Office',
  },
  {
    id: 'event-2',
    title: 'Regional members meetup — Burao',
    startsAt: '2026-10-05T13:00:00.000Z',
    location: 'Burao Branch Office',
  },
  {
    id: 'event-3',
    title: 'Youth wing leadership training',
    startsAt: '2026-10-18T07:00:00.000Z',
    location: 'Waddani Head Office',
  },
];

export const newsEventsApiMock: NewsEventsApi = {
  getNews: () => mockRespond(newsFixtures.map(toNewsItem)),
  getEvents: () => mockRespond(eventFixtures.map(toPartyEvent)),
};
