import { useQuery } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';

import { supportApi } from './api';
import { supportApiMock } from './api.mock';

const api = pickApi('support', supportApi, supportApiMock);

export const supportKeys = {
  contact: ['contact'] as const,
  faqs: ['faqs'] as const,
};

export function useContactInfo() {
  return useQuery({ queryKey: supportKeys.contact, queryFn: () => api.getContactInfo() });
}

export function useFaqs() {
  return useQuery({ queryKey: supportKeys.faqs, queryFn: () => api.getFaqs() });
}
