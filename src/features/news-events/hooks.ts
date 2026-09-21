import { useQuery } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';

import { newsEventsApi } from './api';
import { newsEventsApiMock } from './api.mock';
import { sortEvents, sortNews } from './mappers';

const api = pickApi('newsEvents', newsEventsApi, newsEventsApiMock);

export const newsEventsKeys = {
  news: ['news'] as const,
  events: ['events'] as const,
};

export function useNews() {
  return useQuery({
    queryKey: newsEventsKeys.news,
    queryFn: async () => sortNews(await api.getNews()),
  });
}

export function useEvents() {
  return useQuery({
    queryKey: newsEventsKeys.events,
    queryFn: async () => sortEvents(await api.getEvents()),
  });
}
