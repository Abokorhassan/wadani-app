import { env } from '@/lib/env';

import { ApiRequestError } from '../errors';

/** Mock responses wait a little so loading states are exercised in development. */
export function delay(ms: number = env.mockLatencyMs): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Forces mock endpoints to fail, for checking error states by hand.
 * Toggle it from a dev screen: `setMockFailure(true)`.
 */
let failing = false;

export function setMockFailure(value: boolean): void {
  failing = value;
}

export function isMockFailing(): boolean {
  return failing;
}

export async function mockRespond<T>(value: T, ms?: number): Promise<T> {
  await delay(ms);
  if (failing) throw new ApiRequestError({ kind: 'network' });
  return value;
}
