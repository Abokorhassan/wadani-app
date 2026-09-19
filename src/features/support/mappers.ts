import type { ContactInfoDto, FaqItemDto } from './schemas';
import type { ContactInfo, FaqItem } from './types';

export function toContactInfo(dto: ContactInfoDto): ContactInfo {
  return {
    phone: dto.phone,
    email: dto.email,
    officeName: dto.officeName,
    officeHours: dto.officeHours,
    whatsappNumber: dto.whatsappNumber.replace(/\D/g, ''),
  };
}

export function toFaqItem(dto: FaqItemDto): FaqItem {
  return { id: dto.id, question: dto.question, answer: dto.answer };
}
