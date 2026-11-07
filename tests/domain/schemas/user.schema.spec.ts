import {
  userRequestSchema,
  updateRequestSchema,
} from '../../../src/domain/schemas/user.schema';

describe('User Request Schema', () => {
  const validBody = {
    firstName: 'Leonardo',
    lastName: 'Santos',
    email: 'leonardo@email.com',
    password: '12345678',
    confirmPassword: '12345678',
  };

  it('Should accept a valid body', () => {
    const result = userRequestSchema.safeParse(validBody);

    expect(result.success).toBe(true);
  });

  it('Should reject when a field is empty', () => {
    const result = userRequestSchema.safeParse({
      ...validBody,
      firstName: '',
    });

    expect(result.success).toBe(false);
  });

  it('Should reject an invalid email', () => {
    const result = userRequestSchema.safeParse({
      ...validBody,
      email: 'invalid-email',
    });

    expect(result.success).toBe(false);
  });

  it('Should reject when passwords do not match', () => {
    const result = userRequestSchema.safeParse({
      ...validBody,
      confirmPassword: '87654321',
    });

    expect(result.success).toBe(false);
  });

  it('Should reject when password is shorter than 8 characters', () => {
    const result = userRequestSchema.safeParse({
      ...validBody,
      password: '123',
      confirmPassword: '123',
    });

    expect(result.success).toBe(false);
  });
});

describe('Update Request Schema', () => {
  it('Should trim the name fields', () => {
    const result = updateRequestSchema.safeParse({
      firstName: '  New  ',
      lastName: '  Name  ',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ firstName: 'New', lastName: 'Name' });
  });

  it('Should reject names that are only whitespace', () => {
    const result = updateRequestSchema.safeParse({
      firstName: '   ',
      lastName: 'Name',
    });

    expect(result.success).toBe(false);
  });
});
