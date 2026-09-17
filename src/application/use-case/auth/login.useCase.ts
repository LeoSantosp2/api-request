import { v4 } from 'uuid';

import { UserRepository } from '../../../domain/entities/users.entity';
import { RefreshTokenRepository } from '../../../domain/entities/refresh.token.entity';

import { HttpError } from '../../../presentation/utils/http.error';
import { comparePassword } from '../../../presentation/utils/compare.password';
import {
  generateAccessToken,
  generateRefreshToken,
  expiresRefreshToken,
  hashToken,
} from '../../../presentation/utils/tokens';

export class LoginUseCase {
  constructor(
    protected readonly userRepository: UserRepository,
    protected readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.showByEmail(email);

    if (!user || !comparePassword(password, user.password)) {
      throw new HttpError(401, 'E-mail ou senha inválidos.');
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken();

    await this.refreshTokenRepository.create({
      id: v4(),
      user_id: user.id,
      expires_at: expiresRefreshToken(),
      token_hash: hashToken(refreshToken),
    });

    return {
      id: user.id,
      email: user.email,
      accessToken,
      refreshToken,
    };
  }
}
