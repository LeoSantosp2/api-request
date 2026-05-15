import prisma from '../../config/prisma';

import { login } from '../../repositories/login-repository';
import { LoginRequest } from '../../interfaces/login-request';

jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    users: {
      update: jest.fn(),
    },
  },
}));

describe('Testing Login Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login updates token_auth by email', async () => {
    (prisma.users.update as jest.Mock).mockResolvedValueOnce({});

    const body: LoginRequest = { email: 'a@a.com', password: '123' };
    await login(body, 'token');

    expect(prisma.users.update).toHaveBeenCalledWith({
      data: { token_auth: 'token' },
      where: { email: 'a@a.com' },
    });
  });
});
