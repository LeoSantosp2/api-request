import isEmail from 'validator/lib/isEmail';
import jwt from 'jsonwebtoken';

import env from '../config/env';

import { login } from '../repositories/login-repository';
import { showByEmail } from '../repositories/users-repository';

import { HttpError } from '../utils/http-error';
import { passwordIsValid } from '../utils/password-is-valid';

import { LoginRequest } from '../interfaces/login-request';

export const loginUser = async (userDatas: LoginRequest) => {
  if (!isEmail(userDatas.email)) {
    throw new HttpError(400, 'E-mail inválido.');
  }

  const user = await showByEmail(userDatas.email);

  if (!user) {
    throw new HttpError(404, 'Usuário não existe.');
  }

  if (!(await passwordIsValid(userDatas.email, userDatas.password))) {
    throw new HttpError(400, 'Senha inválida.');
  }

  const token = jwt.sign(
    { id: user.id, email: userDatas.email },
    env.TOKEN_SECRET,
    {
      expiresIn: '7d',
    },
  );

  await login(userDatas, token);

  return {
    id: user.id,
    email: user.email,
    token,
  };
};
