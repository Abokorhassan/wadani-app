import { env } from '@/lib/env';

import { ApiRequestError, parseValidationBody } from './errors';

const TIMEOUT_MS = 15_000;

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  signal?.addEventListener('abort', () => controller.abort());

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiRequestError({ kind: 'network' });
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.text();
  const json: unknown = payload ? safeParse(payload) : null;

  if (response.ok) return json;

  if (response.status === 401) {
    onUnauthorized();
    throw new ApiRequestError({ kind: 'unauthorized' });
  }
  if (response.status === 404) {
    throw new ApiRequestError({ kind: 'not_found' });
  }
  if (response.status === 400 || response.status === 422) {
    const { fieldErrors, message } = parseValidationBody(json);
    throw new ApiRequestError({ kind: 'validation', fieldErrors, message });
  }

  throw new ApiRequestError({
    kind: 'server',
    status: response.status,
    message:
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: unknown }).message)
        : undefined,
  });
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
