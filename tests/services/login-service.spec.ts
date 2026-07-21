import jwt from 'jsonwebtoken';

import { service } from '../../src/modules/login/login-service';
import { LoginRequest } from '../../src/interfaces/login-request';

jest.mock('../../src/config/env', () => ({
  __esModule: true,
  default: {
    TOKEN_SECRET: 'test-secret',
    TOKEN_EXPIRATION: '30d',
    API_PORT: '3000',
  },
}));

jest.mock('../../src/modules/users/user-repository', () => ({
  repository: {
    showByEmail: jest.fn(),
  },
}));

jest.mock('../../src/utils/password-is-valid', () => ({
  passwordIsValid: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(() => 'signed-token'),
  },
}));

describe('Testing Login Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should throw 401 when user does not exist', async () => {
    const { repository: usersRepository } = await import(
      '../../src/modules/users/user-repository'
    );
    (usersRepository.showByEmail as jest.Mock).mockResolvedValueOnce(null);

    const body: LoginRequest = { email: 'a@a.com', password: '12345678' };
    const promise = service.login(body);

    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'E-mail ou senha inválidos.',
    );
  });

  it('Should throw 401 when password is invalid', async () => {
    const { repository: usersRepository } = await import(
      '../../src/modules/users/user-repository'
    );
    const passwordUtil = await import('../../src/utils/password-is-valid');

    (usersRepository.showByEmail as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'a@a.com',
      password: 'hashed-password',
    });
    (passwordUtil.passwordIsValid as jest.Mock).mockReturnValueOnce(false);

    const body: LoginRequest = { email: 'a@a.com', password: 'wrong' };
    const promise = service.login(body);

    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'E-mail ou senha inválidos.',
    );
  });

  it('Should login user and return token', async () => {
    const { repository: usersRepository } = await import(
      '../../src/modules/users/user-repository'
    );
    const passwordUtil = await import('../../src/utils/password-is-valid');

    (usersRepository.showByEmail as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'a@a.com',
      password: 'hashed-password',
    });
    (passwordUtil.passwordIsValid as jest.Mock).mockReturnValueOnce(true);

    (jwt.sign as jest.Mock).mockReturnValueOnce('signed-token');

    const body: LoginRequest = { email: 'a@a.com', password: '12345678' };
    const result = await service.login(body);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '1', email: 'a@a.com' },
      'test-secret',
      { expiresIn: '30d' },
    );
    expect(result).toEqual({
      id: '1',
      email: 'a@a.com',
      token: 'signed-token',
    });
    expect(passwordUtil.passwordIsValid).toHaveBeenCalledWith(
      '12345678',
      'hashed-password',
    );
  });
});
