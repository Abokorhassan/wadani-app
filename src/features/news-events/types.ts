export interface NewsItem {
  id: string;
  title: string;
  /** Plain text, flattened from the HTML the admin portal stores. */
  body: string;
  imageUrl?: string;
  /** ISO date. */
  publishedAt: string;
}

export interface PartyEvent {
  id: string;
  title: string;
  description?: string;
  /** ISO date-time. */
  startsAt: string;
  endsAt?: string;
  venue?: string;
}
