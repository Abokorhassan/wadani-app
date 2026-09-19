export interface NewsItem {
  id: string;
  title: string;
  body: string;
  /** ISO date. */
  publishedAt: string;
}

export interface PartyEvent {
  id: string;
  title: string;
  /** ISO date-time. */
  startsAt: string;
  venue: string;
  isGoing: boolean;
}
