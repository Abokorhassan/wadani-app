import type { EventDto, NewsItemDto } from './schemas';
import type { NewsItem, PartyEvent } from './types';

/**
 * News bodies are HTML from the admin portal's editor; the app renders plain
 * text, so the tags come out here rather than in a screen.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function toNewsItem(dto: NewsItemDto): NewsItem {
  return {
    id: dto.id,
    title: dto.title,
    body: stripHtml(dto.body),
    imageUrl: dto.imageUrl ?? undefined,
    publishedAt: dto.publishedAt,
  };
}

export function toPartyEvent(dto: EventDto): PartyEvent {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? undefined,
    startsAt: dto.startsAt,
    endsAt: dto.endsAt ?? undefined,
    venue: dto.location ?? undefined,
  };
}

/** Newest first for news; soonest first for events. */
export function sortNews(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function sortEvents(events: PartyEvent[]): PartyEvent[] {
  return [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
