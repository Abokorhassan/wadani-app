import { mockRespond } from '@/api/mock/latency';

import type { SupportApi } from './api';
import { toContactInfo, toFaqItem } from './mappers';
import type { ContactInfoDto, FaqItemDto } from './schemas';

/** From the prototype; the party still has to confirm these (build-plan D23). */
export const contactInfoFixture: ContactInfoDto = {
  phone: '+252 63 400 1122',
  email: 'info@waddani.so',
  officeName: 'Waddani House, Hargeisa',
  officeHours: 'Sat–Thu, 8:00 AM – 4:00 PM',
  whatsappNumber: '252634001122',
};

/**
 * Rewritten from the prototype so the answers match what v1 actually does:
 * there is no in-app renewal yet and Zaad payments are confirmed by staff,
 * not instantly (build-plan D21). The party reviews this copy before launch.
 */
export const faqFixtures: FaqItemDto[] = [
  {
    id: 'faq-renew',
    question: 'How do I renew my membership?',
    answer:
      'Your card shows the date your membership runs until. To renew, visit the Waddani office or message us on WhatsApp. Renewing inside the app comes with online payments.',
  },
  {
    id: 'faq-zaad',
    question: 'How does Zaad payment work?',
    answer:
      'Send the payment with Zaad as usual, then enter the amount and the reference number from your confirmation message. The office checks it and your membership is approved once it is confirmed.',
  },
  {
    id: 'faq-family',
    question: 'Can I add family members to my account?',
    answer:
      'Yes. Open Family from the home screen and add them. Each one is reviewed by the office and gets their own membership card.',
  },
  {
    id: 'faq-qr',
    question: "My QR code isn't scanning, what do I do?",
    answer:
      'Turn your screen brightness up and hold the phone steady so the whole code is visible. If it still fails, show your member ID instead, or message us on WhatsApp.',
  },
  {
    id: 'faq-help',
    question: 'How do I get help or report a problem?',
    answer:
      'Tap "Chat on WhatsApp" on the Contact tab to reach the Waddani office directly, or call the office during opening hours.',
  },
];

export const supportApiMock: SupportApi = {
  getContactInfo: () => mockRespond(toContactInfo(contactInfoFixture)),
  getFaqs: () => mockRespond(faqFixtures.map(toFaqItem), 350),
};
