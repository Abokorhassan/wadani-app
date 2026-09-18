import { notificationFixtures } from './api.mock';
import { toNotification } from './mappers';

describe('notification mappers', () => {
  it('maps unknown types to "other" and drops unknown channels', () => {
    const mapped = toNotification({
      ...notificationFixtures[0],
      type: 'election',
      channels: ['SMS', 'WhatsApp'],
    });
    expect(mapped.type).toBe('other');
    expect(mapped.channels).toEqual(['whatsapp']);
  });
});
