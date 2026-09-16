import type { ZodType } from 'zod';

import { ApiRequestError } from './errors';

/**
 * Validates a response against its schema at the API boundary.
 *
 * A failure means the backend no longer matches our contract, so it is loud in
 * development and a generic server error in production (build-plan §4.1).
 */
export function parseResponse<T>(schema: ZodType<T>, data: unknown, context: string): T {
  const result = schema.safeParse(data);

  if (result.success) return result.data;

  if (__DEV__) {
    console.error(
      `[api] ${context} did not match the expected shape:\n`,
      JSON.stringify(result.error.issues, null, 2)
    );
    throw new ApiRequestError(
      { kind: 'server', status: 0, message: `${context}: unexpected response shape` },
      `${context}: unexpected response shape`
    );
  }

  throw new ApiRequestError({ kind: 'server', status: 0 });
}
