import { asApiError, ApiRequestError, isApiError, parseValidationBody } from './errors';

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
});
