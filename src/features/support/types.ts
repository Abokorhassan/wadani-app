export interface ContactInfo {
  phone: string;
  email: string;
  officeName: string;
  officeHours: string;
  /** Digits only, for wa.me links. */
  whatsappNumber: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
