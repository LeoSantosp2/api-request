import jwt from 'jsonwebtoken';
import { mock, MockProxy } from 'jest-mock-extended';

import { LoginUseCase } from '../../../../src/application/use-case/login/login.useCase';
import { UserRepository } from '../../../../src/domain/entities/user.entity';
import { HttpError } from '../../../../src/presentation/utils/http.error';

jest.mock('../../../../src/infrastructure/config/env', () => ({
  __esModule: true,
  default: {
    TOKEN_SECRET: 'test-secret',
    TOKEN_EXPIRATION: '30d',
  },
}));

jest.mock('../../../../src/presentation/utils/compare.password', () => ({
  comparePassword: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: { sign: jest.fn() },
}));

describe('Testing LoginUseCase', () => {
  let userRepository: MockProxy<UserRepository>;
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = mock<UserRepository>();
    loginUseCase = new LoginUseCase(userRepository);
  });

  it('Should throw 401 when user does not exist', async () => {
    userRepository.showByEmail.mockResolvedValueOnce(null);

    const promise = loginUseCase.execute('a@a.com', '12345678');

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'E-mail ou senha inválidos.',
    );
  });

  it('Should throw 401 when password is invalid', async () => {
    const { comparePassword } = jest.requireMock(
      '../../../../src/presentation/utils/compare.password',
    );

    userRepository.showByEmail.mockResolvedValueOnce({
      id: '1',
      first_name: 'A',
      last_name: 'B',
      email: 'a@a.com',
      password: 'hashed-password',
      created_at: new Date(),
      updated_at: new Date(),
    });
    (comparePassword as jest.Mock).mockReturnValueOnce(false);

    const promise = loginUseCase.execute('a@a.com', 'wrong');

    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
  });

  it('Should login user and return token', async () => {
    const { comparePassword } = jest.requireMock(
      '../../../../src/presentation/utils/compare.password',
    );

    userRepository.showByEmail.mockResolvedValueOnce({
      id: '1',
      first_name: 'A',
      last_name: 'B',
      email: 'a@a.com',
      password: 'hashed-password',
      created_at: new Date(),
      updated_at: new Date(),
    });
    (comparePassword as jest.Mock).mockReturnValueOnce(true);
    (jwt.sign as jest.Mock).mockReturnValueOnce('signed-token');

    const result = await loginUseCase.execute('a@a.com', '12345678');

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: '1', email: 'a@a.com' },
      'test-secret',
      { expiresIn: '30d' },
    );
    expect(result).toEqual({
      id: '1',
      email: 'a@a.com',
      accessToken: 'signed-token',
    });
  });
});
