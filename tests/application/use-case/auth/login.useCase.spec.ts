import { mock, MockProxy } from 'jest-mock-extended';

import { LoginUseCase } from '../../../../src/application/use-case/auth/login.useCase';
import { UserRepository } from '../../../../src/domain/entities/users.entity';
import { RefreshTokenRepository } from '../../../../src/domain/entities/refresh.token.entity';
import { HttpError } from '../../../../src/presentation/utils/http.error';

jest.mock('../../../../src/presentation/utils/compare.password', () => ({
  comparePassword: jest.fn(),
}));

jest.mock('../../../../src/presentation/utils/tokens', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  expiresRefreshToken: jest.fn(),
  hashToken: jest.fn(),
}));

jest.mock('uuid', () => ({ v4: jest.fn() }));

const { comparePassword } = jest.requireMock(
  '../../../../src/presentation/utils/compare.password',
);
const {
  generateAccessToken,
  generateRefreshToken,
  expiresRefreshToken,
  hashToken,
} = jest.requireMock('../../../../src/presentation/utils/tokens');
const { v4 } = jest.requireMock('uuid');

const user = {
  id: '1',
  first_name: 'A',
  last_name: 'B',
  email: 'a@a.com',
  password: 'hashed-password',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('Testing LoginUseCase', () => {
  let userRepository: MockProxy<UserRepository>;
  let refreshTokenRepository: MockProxy<RefreshTokenRepository>;
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = mock<UserRepository>();
    refreshTokenRepository = mock<RefreshTokenRepository>();
    loginUseCase = new LoginUseCase(userRepository, refreshTokenRepository);
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

  it('Should not create a refresh token when user does not exist', async () => {
    userRepository.showByEmail.mockResolvedValueOnce(null);

    await expect(
      loginUseCase.execute('a@a.com', '12345678'),
    ).rejects.toBeInstanceOf(HttpError);

    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });

  it('Should throw 401 when password is invalid', async () => {
    userRepository.showByEmail.mockResolvedValueOnce(user);
    (comparePassword as jest.Mock).mockReturnValueOnce(false);

    const promise = loginUseCase.execute('a@a.com', 'wrong');

    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });

  it('Should login user and return access and refresh tokens', async () => {
    const expiresAt = new Date('2026-01-01T00:00:00.000Z');

    userRepository.showByEmail.mockResolvedValueOnce(user);
    (comparePassword as jest.Mock).mockReturnValueOnce(true);
    (generateAccessToken as jest.Mock).mockReturnValueOnce('access-token');
    (generateRefreshToken as jest.Mock).mockReturnValueOnce('refresh-token');
    (expiresRefreshToken as jest.Mock).mockReturnValueOnce(expiresAt);
    (hashToken as jest.Mock).mockReturnValueOnce('hashed-refresh-token');
    (v4 as jest.Mock).mockReturnValueOnce('token-id');

    const result = await loginUseCase.execute('a@a.com', '12345678');

    expect(comparePassword).toHaveBeenCalledWith('12345678', 'hashed-password');
    expect(generateAccessToken).toHaveBeenCalledWith('1', 'a@a.com');
    expect(hashToken).toHaveBeenCalledWith('refresh-token');
    expect(refreshTokenRepository.create).toHaveBeenCalledWith({
      id: 'token-id',
      user_id: '1',
      expires_at: expiresAt,
      token_hash: 'hashed-refresh-token',
    });
    expect(result).toEqual({
      id: '1',
      email: 'a@a.com',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('Should not leak the password hash in the response', async () => {
    userRepository.showByEmail.mockResolvedValueOnce(user);
    (comparePassword as jest.Mock).mockReturnValueOnce(true);

    const result = await loginUseCase.execute('a@a.com', '12345678');

    expect(result).not.toHaveProperty('password');
  });
});
