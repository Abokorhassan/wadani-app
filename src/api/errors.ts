/**
 * One error shape for the whole app. Screens react to `kind`; forms read
 * `fieldErrors`. Mapping the backend's own error format happens here, in one
 * place, once the Postman collection lands (build-plan §4.5).
 */
export type ApiError =
  | { kind: 'network' }
  | { kind: 'unauthorized' }
  | {
      kind: 'validation';
      fieldErrors: Record<string, string>;
      message?: string;
      /** e.g. WRONG_CURRENT_PASSWORD, when the server names the problem. */
      code?: string;
    }
  /**
   * The request was fine but the payment was refused (422): Sifalo declined the
   * charge, the wallet has no route, the PIN was wrong, and so on. Separate from
   * `validation`, because nothing on the form is wrong and `message` is written
   * for the member to read.
   */
  | { kind: 'declined'; message?: string; code?: string }
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
    case 'declined':
      return error.message ?? 'The payment was declined. Please try another method.';
    case 'not_found':
      return 'We could not find what you were looking for.';
    case 'server':
      return error.message ?? 'Something went wrong on our side. Please try again.';
  }
}

/**
 * Maps a backend error body to field errors.
 *
 * The API's own shape is `{ error: { message, details, traceId } }`
 * (api-contract/, schema Error). `details` is **not** a map of field errors --
 * a declined payment sends `details: { code: 'TRANSACTION_FAILED' }` -- so
 * reading it as one invented a field called "code" and sent the wizard to the
 * step for an unknown field with nothing shown. So from `details` only entries
 * holding a list of messages are read as fields, which is how the API reports
 * them (`details: { email: ["A member with this email already exists"] }`);
 * a string such as `code` is surfaced by `errorCode` instead.
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

    const errors = record.errors ?? record.fieldErrors ?? record.fields;
    if (errors && typeof errors === 'object') {
      for (const [field, value] of Object.entries(errors as Record<string, unknown>)) {
        if (typeof value === 'string') fieldErrors[field] = value;
        else if (Array.isArray(value) && typeof value[0] === 'string')
          fieldErrors[field] = value[0];
      }
    }

    const details = record.details;
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      for (const [field, value] of Object.entries(details as Record<string, unknown>)) {
        if (Array.isArray(value) && typeof value[0] === 'string') fieldErrors[field] ??= value[0];
      }
    }
  }

  return { fieldErrors, message };
}

/** The server's own wording, when this kind of error carries one. */
export function serverMessage(error: ApiError): string | undefined {
  return 'message' in error ? error.message : undefined;
}

/** The machine-readable code beside a message, e.g. `TRANSACTION_FAILED`. */
export function errorCode(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const outer = body as Record<string, unknown>;
  const record =
    outer.error && typeof outer.error === 'object'
      ? (outer.error as Record<string, unknown>)
      : outer;
  const details = record.details;
  if (details && typeof details === 'object') {
    const code = (details as Record<string, unknown>).code;
    if (typeof code === 'string') return code;
  }
  return undefined;
}
