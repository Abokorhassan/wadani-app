import { env } from '@/lib/env';

/**
 * The card checkout's return address, and what Sifalo and the API add to it.
 *
 * Sifalo's hosted checkout is a web page, and when the member finishes it
 * redirects to `returnUrl` with `sid` appended; the API appends `checkout_id`.
 * The app runs that page in an in-app browser and stops it the moment it heads
 * for this address, so the member never leaves the app.
 */
export const cardReturnUrl = (): string => env.cardReturnUrl;

export interface CardReturn {
  checkoutId?: string;
  /** Sifalo's transaction id: the proof the confirm call needs. */
  sid?: string;
}

/** Scheme, host and path only: the query is what Sifalo and the API add. */
function base(url: string): string | null {
  const match = /^(https?):\/\/([^/?#]+)([^?#]*)/i.exec(url.trim());
  if (!match) return null;
  const [, scheme, host, path] = match;
  return `${scheme.toLowerCase()}://${host.toLowerCase()}${path.replace(/\/+$/, '') || ''}`;
}

/** True when the in-app browser is being sent to the return page. */
export function isCardReturn(url: string, returnUrl: string = cardReturnUrl()): boolean {
  const target = base(url);
  return target !== null && target === base(returnUrl);
}

function queryParams(url: string): Record<string, string> {
  const query = url.split('#')[0].split('?')[1] ?? '';
  const params: Record<string, string> = {};
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const [rawKey, ...rest] = pair.split('=');
    try {
      params[decodeURIComponent(rawKey)] = decodeURIComponent(rest.join('=').replace(/\+/g, ' '));
    } catch {
      // A malformed pair is skipped rather than failing the whole return.
    }
  }
  return params;
}

/** Reads `sid` and `checkout_id` off the return URL, or null if it is not the return page. */
export function readCardReturn(
  url: string,
  returnUrl: string = cardReturnUrl()
): CardReturn | null {
  if (!isCardReturn(url, returnUrl)) return null;
  const params = queryParams(url);
  return {
    checkoutId: params.checkout_id || params.checkoutId || undefined,
    sid: params.sid || undefined,
  };
}
