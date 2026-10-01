import { env } from '@/lib/env';

import { useDevApiLog } from './dev-log';
import { ApiRequestError, errorCode, parseValidationBody } from './errors';

const TIMEOUT_MS = 15_000;
// Wallet payments (USSD/push) hold the connection open until the customer approves on
// their phone -- Sifalo waits up to 120s. Registration uses this longer timeout so the
// app doesn't abandon the request before Sifalo comes back.
const PAYMENT_TIMEOUT_MS = 130_000;

type TokenProvider = () => string | null;
type UnauthorizedHandler = () => void;

let getToken: TokenProvider = () => null;
let onUnauthorized: UnauthorizedHandler = () => {};

/** Wired up by the auth feature, to keep the client free of feature imports. */
export function configureClient(options: {
  getToken?: TokenProvider;
  onUnauthorized?: UnauthorizedHandler;
}): void {
  if (options.getToken) getToken = options.getToken;
  if (options.onUnauthorized) onUnauthorized = options.onUnauthorized;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Plain object is sent as JSON; FormData is sent as-is for uploads. */
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** Send the access token. On by default; auth endpoints opt out. */
  authenticated?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = env.apiUrl.replace(/\/$/, '');
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/** Never surface a password, in the console or the in-app log, even in dev. */
export function redacted(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const clone = { ...(body as Record<string, unknown>) };
  if ('password' in clone) clone.password = '••••••••';
  return clone;
}

/**
 * Returns parsed JSON. Callers validate it with their feature's zod schema
 * before it reaches a screen, so `unknown` is deliberate here.
 */
export async function request(path: string, options: RequestOptions = {}): Promise<unknown> {
  const { method = 'GET', body, query, authenticated = true, signal } = options;

  if (!env.apiUrl) {
    throw new ApiRequestError(
      { kind: 'server', status: 0, message: 'EXPO_PUBLIC_API_URL is not set' },
      'Missing API URL'
    );
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

  const token = authenticated ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = buildUrl(path, query);
  // Every call is traceable while testing against the live API: what was
  // sent, and exactly what came back, status and body, success or failure.
  // dev-log.ts holds the same thing for the in-app viewer (App info > API log),
  // so a person testing the app can see it without reading device logs.
  const loggedRequest = isFormData
    ? '(form data)'
    : body !== undefined
      ? redacted(body)
      : undefined;
  let logId: string | undefined;
  if (__DEV__) {
    console.log(`[api] → ${method} ${url}`, loggedRequest ?? '');
    logId = useDevApiLog.getState().start({ method, url, requestBody: loggedRequest });
  }

  const controller = new AbortController();
  const isPaymentCall =
    path.includes('/auth/register') ||
    path.includes('/renew') ||
    path.includes('/donations') ||
    path.includes('/payments/card/confirm');
  const timeout = setTimeout(
    () => controller.abort(),
    isPaymentCall ? PAYMENT_TIMEOUT_MS : TIMEOUT_MS
  );
  signal?.addEventListener('abort', () => controller.abort());

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (__DEV__) {
      console.log(`[api] ✕ ${method} ${url} — no response`, error);
      if (logId) {
        useDevApiLog.getState().finish(logId, {
          networkError: true,
          responseBody: error instanceof Error ? error.message : String(error),
        });
      }
    }
    throw new ApiRequestError({ kind: 'network' });
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.text();
  const json: unknown = payload ? safeParse(payload) : null;

  if (__DEV__) {
    console.log(`[api] ← ${response.status} ${method} ${url}`, json ?? '(empty body)');
    if (logId)
      useDevApiLog.getState().finish(logId, { status: response.status, responseBody: json });
  }

  if (response.ok) return json;

  if (response.status === 401) {
    onUnauthorized();
    throw new ApiRequestError({ kind: 'unauthorized' });
  }
  if (response.status === 404) {
    throw new ApiRequestError({ kind: 'not_found' });
  }
  // 400 means the payload is wrong; 422 means the payment itself was refused.
  if (response.status === 400) {
    const { fieldErrors, message } = parseValidationBody(json);
    throw new ApiRequestError({ kind: 'validation', fieldErrors, message });
  }
  if (response.status === 422) {
    const { message } = parseValidationBody(json);
    throw new ApiRequestError({ kind: 'declined', message, code: errorCode(json) }, message);
  }

  // A duplicate phone or email (409) names the field, so it can be shown under it.
  if (response.status === 409) {
    const { fieldErrors, message } = parseValidationBody(json);
    if (Object.keys(fieldErrors).length > 0) {
      throw new ApiRequestError({ kind: 'validation', fieldErrors, message });
    }
  }

  // Everything else (409 conflict, 500, 503…). The API nests its wording under
  // `{ error: { message } }`, so read it that way — otherwise a duplicate phone
  // or an unreachable gateway would collapse to a generic "something went wrong".
  const { message: serverMsg } = parseValidationBody(json);
  throw new ApiRequestError({
    kind: 'server',
    status: response.status,
    message: serverMsg,
  });
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
