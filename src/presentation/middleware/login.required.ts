import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import env from '../../infrastructure/config/env';

import { UnauthorizedError } from '../../domain/errors/http.error';
import { RequestProps } from '../../domain/interfaces/request.props';

export const loginRequired = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError('Necessário fazer login.');
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedError('Token inválido.');
  }

  try {
    const payload = jwt.verify(token, env.TOKEN_SECRET, {
      algorithms: ['HS256'],
    });

    if (typeof payload === 'string' || !payload.id) {
      throw new UnauthorizedError('Token inválido.');
    }

    (req as RequestProps).userId = payload.id;
  } catch {
    throw new UnauthorizedError('Token expirado ou inválido.');
  }

  return next();
};
