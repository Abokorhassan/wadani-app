import { request } from '@/api/client';
import { parseResponse } from '@/api/parse';

import { toContactInfo, toFaqItem } from './mappers';
import { contactInfoDto, faqsResponse } from './schemas';
import type { ContactInfo, FaqItem } from './types';

/** Live endpoints. Paths are placeholders until the Postman collection lands. */
export const supportApi = {
  async getContactInfo(): Promise<ContactInfo> {
    const data = await request('/contact', { authenticated: false });
    return toContactInfo(parseResponse(contactInfoDto, data, 'GET /contact'));
  },

  async getFaqs(): Promise<FaqItem[]> {
    const data = await request('/faqs', { authenticated: false });
    return parseResponse(faqsResponse, data, 'GET /faqs').map(toFaqItem);
  },
};

export type SupportApi = typeof supportApi;
