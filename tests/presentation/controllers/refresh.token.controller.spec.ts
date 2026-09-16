import { mock, MockProxy } from 'jest-mock-extended';
import { Request, Response } from 'express';

import { RefreshTokenController } from '../../../src/presentation/controllers/refresh.token.controller';
import { RefreshTokenUseCase } from '../../../src/application/use-case/auth/refreshToken.useCase';
import { LogoutUseCase } from '../../../src/application/use-case/auth/logout.useCase';

type MockRes = { json: jest.Mock; status: jest.Mock; send: jest.Mock };

describe('Testing RefreshTokenController', () => {
  let refreshTokenUseCase: MockProxy<RefreshTokenUseCase>;
  let logoutUseCase: MockProxy<LogoutUseCase>;
  let refreshTokenController: RefreshTokenController;

  const createMockRes = (): MockRes => {
    const res = { json: jest.fn(), status: jest.fn(), send: jest.fn() };
    res.status.mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    refreshTokenUseCase = mock<RefreshTokenUseCase>();
    logoutUseCase = mock<LogoutUseCase>();
    refreshTokenController = new RefreshTokenController(
      refreshTokenUseCase,
      logoutUseCase,
    );
  });

  it('REFRESH returns the rotated tokens as json', async () => {
    refreshTokenUseCase.execute.mockResolvedValueOnce({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    const res = createMockRes();
    const req = { body: { refreshToken: 'refresh-token' } } as Request;

    await refreshTokenController.REFRESH(req, res as unknown as Response);

    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith('refresh-token');
    expect(res.json).toHaveBeenCalledWith({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
  });

  it('REFRESH propagates the use case error', async () => {
    const error = new Error('Refresh token inválido.');
    refreshTokenUseCase.execute.mockRejectedValueOnce(error);

    const res = createMockRes();
    const req = { body: { refreshToken: 'refresh-token' } } as Request;

    await expect(
      refreshTokenController.REFRESH(req, res as unknown as Response),
    ).rejects.toThrow(error);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('LOGOUT returns 204 with no body', async () => {
    logoutUseCase.execute.mockResolvedValueOnce(undefined);

    const res = createMockRes();
    const req = { body: { refreshToken: 'refresh-token' } } as Request;

    await refreshTokenController.LOGOUT(req, res as unknown as Response);

    expect(logoutUseCase.execute).toHaveBeenCalledWith('refresh-token');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('LOGOUT propagates the use case error', async () => {
    const error = new Error('Token inválido.');
    logoutUseCase.execute.mockRejectedValueOnce(error);

    const res = createMockRes();
    const req = { body: { refreshToken: 'refresh-token' } } as Request;

    await expect(
      refreshTokenController.LOGOUT(req, res as unknown as Response),
    ).rejects.toThrow(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
