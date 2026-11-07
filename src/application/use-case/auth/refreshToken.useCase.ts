import { v4 } from 'uuid';

import { RefreshTokenRepository } from '../../../domain/entities/refresh.token.entity';
import { UserRepository } from '../../../domain/entities/users.entity';
import {
  UnauthorizedError,
  NotFoundError,
} from '../../../domain/errors/http.error';

import {
  generateRefreshToken,
  generateAccessToken,
  hashToken,
  expiresRefreshToken,
} from '../../../presentation/utils/tokens';

export class RefreshTokenUseCase {
  constructor(
    protected readonly refreshTokenRepository: RefreshTokenRepository,
    protected readonly userRepository: UserRepository,
  ) {}

  async execute(refreshToken: string) {
    const storedToken = await this.refreshTokenRepository.listByHash(
      hashToken(refreshToken),
    );

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token inválido.');
    }

    if (storedToken.revoked_at || storedToken.expires_at <= new Date()) {
      throw new UnauthorizedError('Refresh token expirado.');
    }

    const user = await this.userRepository.listOne(storedToken.user_id);

    if (!user) {
      throw new NotFoundError('Usuário inválido.');
    }

    await this.refreshTokenRepository.revoke(hashToken(refreshToken));

    const newRefreshToken = generateRefreshToken();

    await this.refreshTokenRepository.create({
      id: v4(),
      user_id: storedToken.user_id,
      token_hash: hashToken(newRefreshToken),
      expires_at: expiresRefreshToken(),
    });

    return {
      accessToken: generateAccessToken(storedToken.user_id, user.email),
      refreshToken: newRefreshToken,
    };
  }
}
