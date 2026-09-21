/**
 * One error shape for the whole app. Screens react to `kind`; forms read
 * `fieldErrors`. Mapping the backend's own error format happens here, in one
 * place, once the Postman collection lands (build-plan §4.5).
 */
export type ApiError =
  | { kind: 'network' }
  | { kind: 'unauthorized' }
  | { kind: 'validation'; fieldErrors: Record<string, string>; message?: string }
  | { kind: 'not_found' }
  | { kind: 'server'; status: number; message?: string };

export class ApiRequestError extends Error {
  readonly error: ApiError;

  constructor(error: ApiError, message?: string) {
    super(message ?? describeError(error));
    this.name = 'ApiRequestError';
    this.error = error;
  }
}

export function isApiError(value: unknown): value is ApiRequestError {
  return value instanceof ApiRequestError;
}

export function asApiError(value: unknown): ApiError {
  return isApiError(value) ? value.error : { kind: 'server', status: 0 };
}

/** Fallback copy. Screens should prefer their own i18n strings where they can. */
export function describeError(error: ApiError): string {
  switch (error.kind) {
    case 'network':
      return 'No connection. Check your internet and try again.';
    case 'unauthorized':
      return 'Your session has expired. Please log in again.';
    case 'validation':
      return error.message ?? 'Please check the details you entered.';
    case 'not_found':
      return 'We could not find what you were looking for.';
    case 'server':
      return error.message ?? 'Something went wrong on our side. Please try again.';
  }
}

/**
 * Maps a backend error body to field errors. The API's own shape is
 * `{ error: { message, details, traceId } }` (api-contract/, schema Error);
 * `details` is free-form, so the common conventions are tried around it.
 */
export function parseValidationBody(body: unknown): {
  fieldErrors: Record<string, string>;
  message?: string;
} {
  const fieldErrors: Record<string, string> = {};
  let message: string | undefined;

  if (body && typeof body === 'object') {
    const outer = body as Record<string, unknown>;
    const record =
      outer.error && typeof outer.error === 'object'
        ? (outer.error as Record<string, unknown>)
        : outer;

    if (typeof record.message === 'string') message = record.message;

    const errors = record.details ?? record.errors ?? record.fieldErrors ?? record.fields;
    if (errors && typeof errors === 'object') {
      for (const [field, value] of Object.entries(errors as Record<string, unknown>)) {
        if (typeof value === 'string') fieldErrors[field] = value;
        else if (Array.isArray(value) && typeof value[0] === 'string')
          fieldErrors[field] = value[0];
      }
    }
  }

  return { fieldErrors, message };
}
