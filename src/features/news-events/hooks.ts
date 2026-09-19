import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';

import { newsEventsApi } from './api';
import { newsEventsApiMock } from './api.mock';
import { sortEvents, sortNews } from './mappers';
import type { PartyEvent } from './types';

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

/** Flips the button straight away and puts it back if the request fails. */
export function useRsvp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, going }: { eventId: string; going: boolean }) =>
      api.setRsvp(eventId, going),

    onMutate: async ({ eventId, going }) => {
      await queryClient.cancelQueries({ queryKey: newsEventsKeys.events });
      const previous = queryClient.getQueryData<PartyEvent[]>(newsEventsKeys.events);
      queryClient.setQueryData<PartyEvent[]>(newsEventsKeys.events, (events) =>
        events?.map((event) => (event.id === eventId ? { ...event, isGoing: going } : event))
      );
      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(newsEventsKeys.events, context.previous);
      }
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: newsEventsKeys.events }),
  });
}
