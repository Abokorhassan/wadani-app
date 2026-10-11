import { mockRespond } from '@/api/mock/latency';

import type { SupportApi } from './api';
import { toContactInfo, toFaqItem } from './mappers';
import type { ContactInfoDto, FaqItemDto } from './schemas';

/**
 * The support API has no backend yet, so this is what the app shows live. The
 * email and WhatsApp are the party's real ones, as on the legal pages; the phone
 * and office are still the prototype's and need the party to confirm (D23).
 */
export const contactInfoFixture: ContactInfoDto = {
  phone: '+252 63 400 1122',
  email: 'wadaniparty2026@gmail.com',
  officeName: 'Waddani House, Hargeisa',
  officeHours: 'Sat–Thu, 8:00 AM – 4:00 PM',
  whatsappNumber: '252653140475',
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
      'Your card shows the date your membership runs until. Renewing inside the app is coming shortly; until then, visit the Waddani office or message us on WhatsApp.',
  },
  {
    id: 'faq-zaad',
    question: 'How does paying with Zaad work?',
    answer:
      'Choose Zaad / Waafi when you register, enter the wallet number to charge, and confirm the prompt on your phone. The payment goes through straight away and your card is issued as soon as it clears -- there is nothing to send in or wait for.',
  },
  {
    id: 'faq-family',
    question: 'Can I add family members to my account?',
    answer:
      'Not yet. Adding family members from the app is coming; for now, bring them to the Waddani office or message us on WhatsApp.',
  },
  {
    id: 'faq-qr',
    question: "My QR code isn't scanning, what do I do?",
    answer:
      'Turn your screen brightness up and hold the phone steady so the whole code is visible. If it still fails, show the card number printed under the code instead, or message us on WhatsApp.',
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
