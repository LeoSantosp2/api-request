import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import env from '../config/env';

import { HttpError } from '../utils/http-error';

import { RequestProps } from '../interfaces/request-props';

export const loginRequired = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new HttpError(401, 'Necessário fazer login.');
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Token inválido.');
  }

  try {
    const payload = jwt.verify(token, env.TOKEN_SECRET, {
      algorithms: ['HS256'],
    });

    if (typeof payload === 'string' || !payload.id) {
      throw new HttpError(401, 'Token inválido.');
    }

    (req as RequestProps).userId = payload.id;
  } catch {
    throw new HttpError(401, 'Token expirado ou inválido.');
  }

  return next();
};
