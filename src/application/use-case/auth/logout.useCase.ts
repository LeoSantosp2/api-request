import { RefreshTokenRepository } from '../../../domain/entities/refresh.token.entity';
import { UserRepository } from '../../../domain/entities/users.entity';
import { HttpError } from '../../../presentation/utils/http.error';

import { hashToken } from '../../../presentation/utils/tokens';

export class LogoutUseCase {
  constructor(
    protected readonly refreshTokenRepository: RefreshTokenRepository,
    protected readonly userRepository: UserRepository,
  ) {}

  async execute(refreshToken: string) {
    const storedToken = await this.refreshTokenRepository.listByHash(
      hashToken(refreshToken),
    );

    if (!storedToken) {
      throw new HttpError(401, 'Token inválido.');
    }

    const user = await this.userRepository.listOne(storedToken.user_id);

    if (!user) {
      throw new HttpError(401, 'Token inválido.');
    }

    await this.refreshTokenRepository.revoke(hashToken(refreshToken));
  }
}
