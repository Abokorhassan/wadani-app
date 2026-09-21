import { z } from 'zod';

import { memberDto, membershipCardDto } from '@/features/membership/schemas';

/**
 * Backend shapes, from api-contract/waddani-mobile-api.openapi.json.
 *
 * Deliberately loose: the document promises only these two fields, but a
 * strict object would silently drop anything else the backend sends, and we
 * would never find out. Extra keys survive so `login()` can log and use them.
 */
export const loginResponse = z.looseObject({
  accessToken: z.string(),
  memberId: z.string(),
});

export const registerResponse = z.object({
  member: memberDto,
  membershipCard: membershipCardDto.nullish(),
});

export type LoginResponse = z.infer<typeof loginResponse>;
