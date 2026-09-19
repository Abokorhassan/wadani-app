import { z } from 'zod';

/** Backend shapes; rewritten from the Postman collection when it lands (build-plan §4.6). */
export const familyMemberDto = z.object({
  id: z.string(),
  fullName: z.string(),
  relation: z.enum(['spouse', 'child', 'parent', 'sibling']),
  status: z.string(),
  memberId: z.string().nullish(),
});

export const familyResponse = z.array(familyMemberDto);

export type FamilyMemberDto = z.infer<typeof familyMemberDto>;
