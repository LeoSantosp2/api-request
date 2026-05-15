import jwt from 'jsonwebtoken';

import { loginUser } from '../../services/login-service';
import { HttpError } from '../../utils/http-error';
import { LoginRequest } from '../../interfaces/login-request';

jest.mock('../../config/env', () => ({
  __esModule: true,
  default: {
    TOKEN_SECRET: 'test-secret',
    API_PORT: '3000',
  },
}));

jest.mock('validator/lib/isEmail', () => ({
  __esModule: true,
  default: (email: string) => email.includes('@'),
}));

jest.mock('../../repositories/login-repository', () => ({
  login: jest.fn(),
}));

jest.mock('../../repositories/users-repository', () => ({
  showByEmail: jest.fn(),
}));

jest.mock('../../utils/password-is-valid', () => ({
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

  it('Should throw 400 when email is invalid', async () => {
    const body: LoginRequest = { email: 'invalid', password: '12345678' };
    const promise = loginUser(body);

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 400 });
    await expect(promise).rejects.toHaveProperty('message', 'E-mail inválido.');
  });

  it('Should throw 404 when user does not exist', async () => {
    const usersRepository = await import('../../repositories/users-repository');
    (usersRepository.showByEmail as jest.Mock).mockResolvedValueOnce(null);

    const body: LoginRequest = { email: 'a@a.com', password: '12345678' };
    const promise = loginUser(body);

    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Usuário não existe.',
    );
  });

  it('Should throw 400 when password is invalid', async () => {
    const usersRepository = await import('../../repositories/users-repository');
    const passwordUtil = await import('../../utils/password-is-valid');

    (usersRepository.showByEmail as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'a@a.com',
    });
    (passwordUtil.passwordIsValid as jest.Mock).mockResolvedValueOnce(false);

    const body: LoginRequest = { email: 'a@a.com', password: 'wrong' };
    const promise = loginUser(body);

    await expect(promise).rejects.toMatchObject({ statusCode: 400 });
    await expect(promise).rejects.toHaveProperty('message', 'Senha inválida.');
  });

  it('Should login user and return token', async () => {
    const usersRepository = await import('../../repositories/users-repository');
    const loginRepository = await import('../../repositories/login-repository');
    const passwordUtil = await import('../../utils/password-is-valid');

    (usersRepository.showByEmail as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'a@a.com',
    });
    (passwordUtil.passwordIsValid as jest.Mock).mockResolvedValueOnce(true);

    (jwt.sign as jest.Mock).mockReturnValueOnce('signed-token');
    (loginRepository.login as jest.Mock).mockResolvedValueOnce({});

    const body: LoginRequest = { email: 'a@a.com', password: '12345678' };
    const result = await loginUser(body);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '1', email: 'a@a.com' },
      'test-secret',
      { expiresIn: '7d' },
    );
    expect(loginRepository.login).toHaveBeenCalledWith(
      { email: 'a@a.com', password: '12345678' },
      'signed-token',
    );
    expect(result).toEqual({
      id: '1',
      email: 'a@a.com',
      token: 'signed-token',
    });
  });
});
