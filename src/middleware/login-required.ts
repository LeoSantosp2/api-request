import { Request, Response, NextFunction } from 'express';

import prisma from '../config/prisma';

import { HttpError } from '../utils/http-error';

export const loginRequired = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new HttpError(401, 'Necessário fazer login.');
  }

  const user = await prisma.users.findFirst({ where: { token_auth: token } });

  if (!user) {
    throw new HttpError(401, 'Usuário inválido.');
  }

  return next();
};
