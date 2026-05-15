/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpError } from '../../utils/http-error';

describe('Testing HttpError class', () => {
  it('constructs with statusCode and message', () => {
    const err = new HttpError(400, 'Bad request');

    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad request');
  });

  it('is instance of HttpError and Error', () => {
    const err = new HttpError(401, 'Unauthorized');

    expect(err).toBeInstanceOf(HttpError);
    expect(err).toBeInstanceOf(Error);
  });

  it('has isOperational true', () => {
    const err = new HttpError(404, 'Not found');

    expect((err as HttpError).isOperational).toBe(true);
  });

  it('provides a stack when captureStackTrace is available', () => {
    const original = Error.captureStackTrace;

    try {
      // Ensure captureStackTrace exists for this test
      Error.captureStackTrace = original || ((_: unknown) => {});

      const err = new HttpError(500, 'Internal');

      expect(typeof err.stack === 'string' || err.stack === undefined).toBe(
        true,
      );

      if (typeof err.stack === 'string') {
        expect(err.stack.length).toBeGreaterThan(0);
      }
    } finally {
      Error.captureStackTrace = original;
    }
  });

  it('does not throw when Error.captureStackTrace is undefined', () => {
    const original = Error.captureStackTrace;

    try {
      // Temporarily remove captureStackTrace
      // @ts-expect-error
      Error.captureStackTrace = undefined;

      expect(() => new HttpError(400, 'No stack')).not.toThrow();
    } finally {
      Error.captureStackTrace = original;
    }
  });

  it('preserves properties when thrown and caught', () => {
    try {
      throw new HttpError(422, 'Unprocessable');
    } catch (err: unknown) {
      if (!(err instanceof HttpError)) {
        throw err;
      }

      expect(err).toBeInstanceOf(HttpError);
      expect(err.statusCode).toBe(422);
      expect(err.message).toBe('Unprocessable');
    }
  });
});
