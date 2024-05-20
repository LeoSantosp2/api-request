import isEmail from 'validator/lib/isEmail';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

import knex from '../config/knex';
import env from '../config/env';

import { passwordIsValid } from '../utils/password-is-valid';

class LoginController {
  async store(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Os campos não podem estar vazios.',
        });
      }

      if (!isEmail(email)) {
        return res.status(400).json({
          error: 'E-mail inválido.',
        });
      }

      const user = await knex('users').select('*').where('email', '=', email);

      if (user.length === 0) {
        return res.status(400).json({
          error: 'Usuário não existe.',
        });
      }

      if (!(await passwordIsValid(email, password))) {
        return res.status(400).json({
          error: 'Senha inválida.',
        });
      }

      const id = user[0].id;

      const token = jwt.sign({ id, email }, env.TOKEN_SECRET, {
        expiresIn: env.TOKEN_EXPIRATION,
      });

      await knex('users')
        .update({ token_id: token })
        .where('email', '=', email);

      return res.json({ id: id, email: email, token: token });
    } catch (err) {
      if (err instanceof Error) {
        return res.status(400).json({
          error: err.message,
        });
      }
    }
  }
}

export default new LoginController();