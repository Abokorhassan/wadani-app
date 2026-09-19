import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { pickApi } from '@/api/mode';

import { familyApi, type NewFamilyMember } from './api';
import { familyApiMock } from './api.mock';

const api = pickApi('family', familyApi, familyApiMock);

export const familyKeys = {
  list: ['family'] as const,
};

export function useFamily() {
  return useQuery({ queryKey: familyKeys.list, queryFn: () => api.getFamily() });
}

export function useAddFamilyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewFamilyMember) => api.addFamilyMember(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: familyKeys.list }),
  });
}
