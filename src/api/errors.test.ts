import {
  asApiError,
  ApiRequestError,
  errorCode,
  isApiError,
  parseValidationBody,
  serverMessage,
} from './errors';

describe('api errors', () => {
  it('recognises its own errors', () => {
    const error = new ApiRequestError({ kind: 'network' });
    expect(isApiError(error)).toBe(true);
    expect(asApiError(error).kind).toBe('network');
  });

  it('treats anything else as a server error', () => {
    expect(asApiError(new Error('boom'))).toEqual({ kind: 'server', status: 0 });
  });

  it('reads field errors given as strings or arrays', () => {
    expect(
      parseValidationBody({
        message: 'Validation failed',
        errors: { email: 'Already taken', phone: ['Invalid number'] },
      })
    ).toEqual({
      message: 'Validation failed',
      fieldErrors: { email: 'Already taken', phone: 'Invalid number' },
    });
  });

  it('survives an unexpected error body', () => {
    expect(parseValidationBody('nope')).toEqual({ fieldErrors: {}, message: undefined });
  });

  /** The body a declined Sifalo charge really returned on 2026-09-22. */
  const declined = {
    error: {
      message:
        'No payment route was found for the specified customer account. Please contact customer support for assistance',
      details: { code: 'TRANSACTION_FAILED' },
      traceId: 'cbfa12e7a808589b09b438d4fac3e8b6',
    },
  };

  it('reads the message out of the API error envelope', () => {
    expect(parseValidationBody(declined).message).toContain('No payment route was found');
  });

  it('does not mistake `details` for field errors', () => {
    // It used to: `details: { code: ... }` became a field error named "code",
    // which sent the registration wizard to the step for an unknown field and
    // showed the member nothing at all.
    expect(parseValidationBody(declined).fieldErrors).toEqual({});
  });

  it('keeps the machine-readable code separate', () => {
    expect(errorCode(declined)).toBe('TRANSACTION_FAILED');
    expect(errorCode({ error: { message: 'no details' } })).toBeUndefined();
    expect(errorCode('nope')).toBeUndefined();
  });

  it('reads a server message only from the kinds that carry one', () => {
    expect(serverMessage({ kind: 'declined', message: 'Declined' })).toBe('Declined');
    expect(serverMessage({ kind: 'network' })).toBeUndefined();
    expect(serverMessage({ kind: 'validation', fieldErrors: {} })).toBeUndefined();
  });
});
