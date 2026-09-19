import { contactInfoFixture } from './api.mock';
import { toContactInfo } from './mappers';

describe('contact mapping', () => {
  it('strips formatting from the WhatsApp number so wa.me links work', () => {
    const contact = toContactInfo({ ...contactInfoFixture, whatsappNumber: '+252 63 400 1122' });
    expect(contact.whatsappNumber).toBe('252634001122');
    expect(contact.phone).toBe('+252 63 400 1122');
  });
});
