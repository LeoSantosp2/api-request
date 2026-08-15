import { loginRequestSchema } from '../../src/domain/login/login.schema';

describe('Login Request Schema', () => {
  it('Should accept a valid body', () => {
    const result = loginRequestSchema.safeParse({
      email: 'leonardo@email.com',
      password: '12345678',
    });

    expect(result.success).toBe(true);
  });

  it('Should reject an invalid email', () => {
    const result = loginRequestSchema.safeParse({
      email: 'invalid-email',
      password: '12345678',
    });

    expect(result.success).toBe(false);
  });

  it('Should reject an empty password', () => {
    const result = loginRequestSchema.safeParse({
      email: 'leonardo@email.com',
      password: '',
    });

    expect(result.success).toBe(false);
  });
});
