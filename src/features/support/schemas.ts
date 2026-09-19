import { z } from 'zod';

/** Backend shapes; rewritten from the Postman collection when it lands (build-plan §4.6). */
export const contactInfoDto = z.object({
  phone: z.string(),
  email: z.string(),
  officeName: z.string(),
  officeHours: z.string(),
  whatsappNumber: z.string(),
});

export const faqItemDto = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const faqsResponse = z.array(faqItemDto);

export type ContactInfoDto = z.infer<typeof contactInfoDto>;
export type FaqItemDto = z.infer<typeof faqItemDto>;
