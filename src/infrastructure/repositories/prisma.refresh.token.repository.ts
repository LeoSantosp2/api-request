import { prisma } from '../database/prisma.config';

import {
  RefreshTokenRepository,
  CreateRefreshToken,
} from '../../domain/entities/refresh.token.entity';

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async listByHash(tokenHash: string) {
    return await prisma.refreshToken.findFirst({
      where: { token_hash: tokenHash },
    });
  }

  async create(refreshToken: CreateRefreshToken) {
    await prisma.refreshToken.create({ data: refreshToken });
  }

  async revoke(tokenHash: string) {
    await prisma.refreshToken.update({
      data: { revoked_at: new Date() },
      where: { token_hash: tokenHash },
    });
  }
}
