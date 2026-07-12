import jwt, { SignOptions } from 'jsonwebtoken';

import env from '../config/env';

import { showByEmail } from '../repositories/users-repository';

import { HttpError } from '../utils/http-error';
import { passwordIsValid } from '../utils/password-is-valid';

import { LoginRequest } from '../interfaces/login-request';

export const loginUser = async (userDatas: LoginRequest) => {
  const user = await showByEmail(userDatas.email);

  if (!user || !passwordIsValid(userDatas.password, user.password)) {
    throw new HttpError(401, 'E-mail ou senha inválidos.');
  }

  const token = jwt.sign(
    { id: user.id, email: userDatas.email },
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
};
