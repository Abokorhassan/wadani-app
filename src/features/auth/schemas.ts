import { z } from 'zod';

import { memberDto } from '@/features/membership/schemas';

/** Backend shapes; rewritten from the Postman collection when it lands (build-plan §4.6). */
export const authResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string().nullish(),
  member: memberDto,
});

export type AuthResponse = z.infer<typeof authResponse>;
