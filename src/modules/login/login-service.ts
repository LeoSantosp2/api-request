import jwt, { SignOptions } from 'jsonwebtoken';

import env from '../../config/env';

import { repository } from '../users/user-repository';

import { HttpError } from '../../utils/http-error';
import { passwordIsValid } from '../../utils/password-is-valid';

import { LoginRequest } from '../../types/login-props';

export const service = {
  async login(loginRequest: LoginRequest) {
    const user = await repository.showByEmail(loginRequest.email);

    if (!user || !passwordIsValid(loginRequest.password, user.password)) {
      throw new HttpError(401, 'E-mail ou senha inválidos.');
    }

    const token = jwt.sign(
      { id: user.id, email: loginRequest.email },
      env.TOKEN_SECRET,
      {
        expiresIn: env.TOKEN_EXPIRATION as SignOptions['expiresIn'],
      },
    );

    return {
      id: user.id,
      email: user.email,
      token,
    };
  },
};
