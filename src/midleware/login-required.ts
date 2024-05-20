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
      errors: ['Necessário fazer login.'],
    });
  }

  try {
    const user = await knex('users')
      .select('token_id')
      .where('token_id', '=', token);

    if (user.length === 0) {
      return res.status(401).json({
        errors: ['Usuário inválido.'],
      });
    }

    return next();
  } catch (err) {
    return res.status(401).json({
      errors: ['Token expirado ou inválido.'],
    });
  }
};
