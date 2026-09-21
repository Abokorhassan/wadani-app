import { eventFixtures, newsFixtures } from './api.mock';
import { sortEvents, sortNews, toNewsItem, toPartyEvent } from './mappers';

describe('news and event mappers', () => {
  it('shows the newest news first', () => {
    const sorted = sortNews(newsFixtures.map(toNewsItem).reverse());
    expect(sorted.map((item) => item.id)).toEqual(['news-3', 'news-2', 'news-1']);
  });

  it('shows the soonest event first', () => {
    const sorted = sortEvents(eventFixtures.map(toPartyEvent).reverse());
    expect(sorted.map((event) => event.id)).toEqual(['event-1', 'event-2', 'event-3']);
  });
});
