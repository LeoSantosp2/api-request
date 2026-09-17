import { refreshTokenSchema } from '../../../src/domain/schemas/refresh.token.schema';

describe('Refresh Token Schema', () => {
  it('Should accept a valid body', () => {
    const result = refreshTokenSchema.safeParse({
      refreshToken: 'a-refresh-token',
    });

    expect(result.success).toBe(true);
  });

  it('Should reject an empty token', () => {
    const result = refreshTokenSchema.safeParse({ refreshToken: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'O campo não pode estar vazio.',
    );
  });

  it('Should reject a missing token', () => {
    const result = refreshTokenSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('Should reject a non string token', () => {
    const result = refreshTokenSchema.safeParse({ refreshToken: 123 });

    expect(result.success).toBe(false);
  });
});
