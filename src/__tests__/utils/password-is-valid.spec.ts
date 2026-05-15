import { hashSync } from 'bcrypt';

import prisma from '../../config/prisma';

import { passwordIsValid } from '../../utils/password-is-valid';

jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    users: {
      findFirst: jest.fn(),
    },
  },
}));

describe('Testing passwordIsValid function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupUserMock = (email: string, password: string) => {
    const hashedPassword = hashSync(password, 8);
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '123',
      email,
      password: hashedPassword,
    });
  };

  it('should return True when email and password are valid', async () => {
    setupUserMock('email@email.com', '12345678');

    const isValid = await passwordIsValid('email@email.com', '12345678');

    expect(isValid).toEqual(true);
  });

  it('Should return False when password is invalid', async () => {
    setupUserMock('email@email.com', 'password100');

    const isValid = await passwordIsValid('email@email.com', '123456789');

    expect(isValid).toEqual(false);
  });
});
