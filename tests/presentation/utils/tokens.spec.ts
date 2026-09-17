import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  expiresRefreshToken,
} from '../../../src/presentation/utils/tokens';

jest.mock('../../../src/infrastructure/config/env', () => ({
  __esModule: true,
  default: {
    TOKEN_SECRET: 'test-secret',
    TOKEN_EXPIRATION: '30d',
    REFRESH_TOKEN_EXPIRATION: '7',
  },
}));

describe('Testing generateAccessToken', () => {
  it('Should sign a token carrying the user id and email', () => {
    const token = generateAccessToken('1', 'a@a.com');
    const payload = jwt.verify(token, 'test-secret') as jwt.JwtPayload;

    expect(payload.id).toBe('1');
    expect(payload.email).toBe('a@a.com');
  });

  it('Should not be verifiable with a different secret', () => {
    const token = generateAccessToken('1', 'a@a.com');

    expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
  });

  it('Should set an expiration on the token', () => {
    const token = generateAccessToken('1', 'a@a.com');
    const payload = jwt.verify(token, 'test-secret') as jwt.JwtPayload;

    expect(payload.exp).toBeDefined();
    expect(payload.exp).toBeGreaterThan(payload.iat as number);
  });
});

describe('Testing generateRefreshToken', () => {
  it('Should return a 128 character hex string', () => {
    const token = generateRefreshToken();

    expect(token).toMatch(/^[0-9a-f]{128}$/);
  });

  it('Should return a different token on each call', () => {
    expect(generateRefreshToken()).not.toEqual(generateRefreshToken());
  });
});

describe('Testing hashToken', () => {
  it('Should return the sha256 hash of the token', () => {
    const expected = crypto
      .createHash('sha256')
      .update('refresh-token')
      .digest('hex');

    expect(hashToken('refresh-token')).toBe(expected);
  });

  it('Should be deterministic for the same token', () => {
    expect(hashToken('refresh-token')).toBe(hashToken('refresh-token'));
  });

  it('Should never return the raw token', () => {
    expect(hashToken('refresh-token')).not.toBe('refresh-token');
  });
});

describe('Testing expiresRefreshToken', () => {
  it('Should return a date REFRESH_TOKEN_EXPIRATION days in the future', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    expect(expiresRefreshToken().toISOString()).toBe(
      '2026-01-08T00:00:00.000Z',
    );

    jest.useRealTimers();
  });

  it('Should return a date in the future', () => {
    expect(expiresRefreshToken().getTime()).toBeGreaterThan(Date.now());
  });
});
