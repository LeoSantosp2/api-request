import jwt, { SignOptions } from 'jsonwebtoken';

import env from '../../../infrastructure/config/env';

import { UserRepository } from '../../../domain/entities/user.entity';

import { HttpError } from '../../../presentation/utils/http.error';
import { comparePassword } from '../../../presentation/utils/compare.password';

export class LoginUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.showByEmail(email);

    if (!user || !comparePassword(password, user.password)) {
      throw new HttpError(401, 'E-mail ou senha inválidos.');
    }

    const token = jwt.sign({ id: user.id, email: email }, env.TOKEN_SECRET, {
      expiresIn: env.TOKEN_EXPIRATION as SignOptions['expiresIn'],
    });

    return {
      id: user.id,
      email: user.email,
      accessToken: token,
    };
  }
}
