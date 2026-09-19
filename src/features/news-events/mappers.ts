import type { EventDto, NewsItemDto } from './schemas';
import type { NewsItem, PartyEvent } from './types';

export function toNewsItem(dto: NewsItemDto): NewsItem {
  return { id: dto.id, title: dto.title, body: dto.body, publishedAt: dto.publishedAt };
}

export function toPartyEvent(dto: EventDto): PartyEvent {
  return {
    id: dto.id,
    title: dto.title,
    startsAt: dto.startsAt,
    venue: dto.venue,
    isGoing: dto.isGoing ?? false,
  };
}

/** Newest first for news; soonest first for events. */
export function sortNews(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function sortEvents(events: PartyEvent[]): PartyEvent[] {
  return [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
