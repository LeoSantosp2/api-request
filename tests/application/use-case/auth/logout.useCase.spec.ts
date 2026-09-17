import { mock, MockProxy } from 'jest-mock-extended';

import { LogoutUseCase } from '../../../../src/application/use-case/auth/logout.useCase';
import { UserRepository } from '../../../../src/domain/entities/users.entity';
import {
  RefreshToken,
  RefreshTokenRepository,
} from '../../../../src/domain/entities/refresh.token.entity';
import { HttpError } from '../../../../src/presentation/utils/http.error';

jest.mock('../../../../src/presentation/utils/tokens', () => ({
  hashToken: jest.fn(),
}));

const { hashToken } = jest.requireMock(
  '../../../../src/presentation/utils/tokens',
);

const user = {
  id: '1',
  first_name: 'A',
  last_name: 'B',
  email: 'a@a.com',
  password: 'hashed-password',
  created_at: new Date(),
  updated_at: new Date(),
};

const storedToken: RefreshToken = {
  id: 'stored-id',
  user_id: '1',
  token_hash: 'hashed-refresh-token',
  expires_at: new Date(Date.now() + 60000),
  revoked_at: null,
  created_at: new Date(),
};

describe('Testing LogoutUseCase', () => {
  let refreshTokenRepository: MockProxy<RefreshTokenRepository>;
  let userRepository: MockProxy<UserRepository>;
  let logoutUseCase: LogoutUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    refreshTokenRepository = mock<RefreshTokenRepository>();
    userRepository = mock<UserRepository>();
    logoutUseCase = new LogoutUseCase(refreshTokenRepository, userRepository);
    (hashToken as jest.Mock).mockImplementation(
      (token: string) => `hashed-${token}`,
    );
  });

  it('Should throw 401 when the token is not found', async () => {
    refreshTokenRepository.listByHash.mockResolvedValueOnce(null);

    const promise = logoutUseCase.execute('refresh-token');

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
    await expect(promise).rejects.toHaveProperty('message', 'Token inválido.');
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });

  it('Should throw 401 when the user no longer exists', async () => {
    refreshTokenRepository.listByHash.mockResolvedValueOnce(storedToken);
    userRepository.listOne.mockResolvedValueOnce(null);

    const promise = logoutUseCase.execute('refresh-token');

    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
    await expect(promise).rejects.toHaveProperty('message', 'Token inválido.');
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });

  it('Should revoke the refresh token by its hash', async () => {
    refreshTokenRepository.listByHash.mockResolvedValueOnce(storedToken);
    userRepository.listOne.mockResolvedValueOnce(user);

    await expect(
      logoutUseCase.execute('refresh-token'),
    ).resolves.toBeUndefined();

    expect(refreshTokenRepository.listByHash).toHaveBeenCalledWith(
      'hashed-refresh-token',
    );
    expect(userRepository.listOne).toHaveBeenCalledWith('1');
    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(
      'hashed-refresh-token',
    );
  });
});
