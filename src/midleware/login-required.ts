import { Request, Response, NextFunction } from 'express';

import knex from '../config/knex';

export const loginRequired = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      error: 'Necessário fazer login.',
    });
  }

  try {
    const user = await knex('users')
      .select('token_id')
      .where('token_id', '=', token)
      .first();

    if (!user) {
      return res.status(401).json({
        error: 'Usuário inválido.',
      });
    }

    return next();
  } catch (err) {
    return res.status(401).json({
      error: 'Token expirado ou inválido.',
    });
  }
};
