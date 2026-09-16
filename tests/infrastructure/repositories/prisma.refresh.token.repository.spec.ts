import { prisma } from '../../../src/infrastructure/database/prisma.config';

import { PrismaRefreshTokenRepository } from '../../../src/infrastructure/repositories/prisma.refresh.token.repository';
import { CreateRefreshToken } from '../../../src/domain/entities/refresh.token.entity';

jest.mock('../../../src/infrastructure/database/prisma.config', () => ({
  prisma: {
    refreshToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

describe('Testing PrismaRefreshTokenRepository', () => {
  const repository = new PrismaRefreshTokenRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('listByHash calls prisma.refreshToken.findFirst with the token hash', async () => {
    (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
    });

    const result = await repository.listByHash('hashed-token');

    expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
      where: { token_hash: 'hashed-token' },
    });
    expect(result).toEqual({ id: '1' });
  });

  it('listByHash returns null when no token matches', async () => {
    (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValueOnce(null);

    await expect(repository.listByHash('hashed-token')).resolves.toBeNull();
  });

  it('create calls prisma.refreshToken.create with the token data', async () => {
    const newToken: CreateRefreshToken = {
      id: '1',
      user_id: '1',
      token_hash: 'hashed-token',
      expires_at: new Date('2026-01-08T00:00:00.000Z'),
    };

    (prisma.refreshToken.create as jest.Mock).mockResolvedValueOnce(undefined);

    await expect(repository.create(newToken)).resolves.toBeUndefined();

    expect(prisma.refreshToken.create).toHaveBeenCalledWith({
      data: newToken,
    });
  });

  it('revoke calls prisma.refreshToken.update setting revoked_at for the hash', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    (prisma.refreshToken.update as jest.Mock).mockResolvedValueOnce(undefined);

    await expect(repository.revoke('hashed-token')).resolves.toBeUndefined();

    expect(prisma.refreshToken.update).toHaveBeenCalledWith({
      data: { revoked_at: new Date('2026-01-01T00:00:00.000Z') },
      where: { token_hash: 'hashed-token' },
    });

    jest.useRealTimers();
  });

  it('revokeAll calls prisma.refreshToken.updateMany for every token of the user', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValueOnce(
      undefined,
    );

    await expect(repository.revokeAll('1')).resolves.toBeUndefined();

    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      data: { revoked_at: new Date('2026-01-01T00:00:00.000Z') },
      where: { user_id: '1' },
    });

    jest.useRealTimers();
  });
});
