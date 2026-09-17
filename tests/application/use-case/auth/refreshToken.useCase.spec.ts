import { mock, MockProxy } from 'jest-mock-extended';

import { RefreshTokenUseCase } from '../../../../src/application/use-case/auth/refreshToken.useCase';
import { UserRepository } from '../../../../src/domain/entities/users.entity';
import {
  RefreshToken,
  RefreshTokenRepository,
} from '../../../../src/domain/entities/refresh.token.entity';
import { HttpError } from '../../../../src/presentation/utils/http.error';

jest.mock('../../../../src/presentation/utils/tokens', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  expiresRefreshToken: jest.fn(),
  hashToken: jest.fn(),
}));

jest.mock('uuid', () => ({ v4: jest.fn() }));

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

const storedToken = (overrides: Partial<RefreshToken> = {}): RefreshToken => ({
  id: 'stored-id',
  user_id: '1',
  token_hash: 'hashed-refresh-token',
  expires_at: new Date(Date.now() + 60000),
  revoked_at: null,
  created_at: new Date(),
  ...overrides,
});

describe('Testing RefreshTokenUseCase', () => {
  let refreshTokenRepository: MockProxy<RefreshTokenRepository>;
  let userRepository: MockProxy<UserRepository>;
  let refreshTokenUseCase: RefreshTokenUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    refreshTokenRepository = mock<RefreshTokenRepository>();
    userRepository = mock<UserRepository>();
    refreshTokenUseCase = new RefreshTokenUseCase(
      refreshTokenRepository,
      userRepository,
    );
    (hashToken as jest.Mock).mockImplementation(
      (token: string) => `hashed-${token}`,
    );
  });

  it('Should throw 401 when the token is not found', async () => {
    refreshTokenRepository.listByHash.mockResolvedValueOnce(null);

    const promise = refreshTokenUseCase.execute('refresh-token');

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Refresh token inválido.',
    );
  });

  it('Should look up the token by its hash and never by its raw value', async () => {
    refreshTokenRepository.listByHash.mockResolvedValueOnce(null);

    await expect(
      refreshTokenUseCase.execute('refresh-token'),
    ).rejects.toBeInstanceOf(HttpError);

    expect(refreshTokenRepository.listByHash).toHaveBeenCalledWith(
      'hashed-refresh-token',
    );
  });

  it('Should throw 401 when the token was already revoked', async () => {
    refreshTokenRepository.listByHash.mockResolvedValueOnce(
      storedToken({ revoked_at: new Date() }),
    );

    const promise = refreshTokenUseCase.execute('refresh-token');

    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Refresh token expirado.',
    );
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });

  it('Should throw 401 when the token is expired', async () => {
    refreshTokenRepository.listByHash.mockResolvedValueOnce(
      storedToken({ expires_at: new Date(Date.now() - 60000) }),
    );

    const promise = refreshTokenUseCase.execute('refresh-token');

    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });

  it('Should throw 404 when the user no longer exists', async () => {
    refreshTokenRepository.listByHash.mockResolvedValueOnce(storedToken());
    userRepository.listOne.mockResolvedValueOnce(null);

    const promise = refreshTokenUseCase.execute('refresh-token');

    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Usuário inválido.',
    );
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });

  it('Should rotate the token and return new access and refresh tokens', async () => {
    const expiresAt = new Date('2026-01-01T00:00:00.000Z');

    refreshTokenRepository.listByHash.mockResolvedValueOnce(storedToken());
    userRepository.listOne.mockResolvedValueOnce(user);
    (generateRefreshToken as jest.Mock).mockReturnValueOnce('new-refresh');
    (generateAccessToken as jest.Mock).mockReturnValueOnce('new-access');
    (expiresRefreshToken as jest.Mock).mockReturnValueOnce(expiresAt);
    (v4 as jest.Mock).mockReturnValueOnce('new-token-id');

    const result = await refreshTokenUseCase.execute('refresh-token');

    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(
      'hashed-refresh-token',
    );
    expect(refreshTokenRepository.create).toHaveBeenCalledWith({
      id: 'new-token-id',
      user_id: '1',
      token_hash: 'hashed-new-refresh',
      expires_at: expiresAt,
    });
    expect(generateAccessToken).toHaveBeenCalledWith('1', 'a@a.com');
    expect(result).toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
  });

  it('Should revoke the old token before storing the new one', async () => {
    refreshTokenRepository.listByHash.mockResolvedValueOnce(storedToken());
    userRepository.listOne.mockResolvedValueOnce(user);
    (generateRefreshToken as jest.Mock).mockReturnValueOnce('new-refresh');

    await refreshTokenUseCase.execute('refresh-token');

    const revokeOrder =
      refreshTokenRepository.revoke.mock.invocationCallOrder[0];
    const createOrder =
      refreshTokenRepository.create.mock.invocationCallOrder[0];

    expect(revokeOrder).toBeLessThan(createOrder);
  });

  it('Should not return the same refresh token that was sent', async () => {
    refreshTokenRepository.listByHash.mockResolvedValueOnce(storedToken());
    userRepository.listOne.mockResolvedValueOnce(user);
    (generateRefreshToken as jest.Mock).mockReturnValueOnce('new-refresh');

    const result = await refreshTokenUseCase.execute('refresh-token');

    expect(result.refreshToken).not.toBe('refresh-token');
  });
});
