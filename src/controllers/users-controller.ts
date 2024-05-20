import isEmail from 'validator/lib/isEmail';
import { Request, Response } from 'express';
import { v4 } from 'uuid';
import { hashSync } from 'bcrypt';

import knex from '../config/knex';

class UsersController {
  async index(req: Request, res: Response) {
    try {
      const response = await knex('users').select('*');

      return res.json(response);
    } catch (err) {
      if (err instanceof Error) {
        return res.status(400).json({
          error: err.message,
        });
      }
    }
  }

  async show(req: Request, res: Response) {
    try {
      const response = await knex('users')
        .select('*')
        .where('id', req.params.id);

      return res.json(response);
    } catch (err) {
      if (err instanceof Error) {
        return res.status(400).json({
          error: err.message,
        });
      }
    }
  }

  async store(req: Request, res: Response) {
    try {
      if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.email ||
        !req.body.password ||
        !req.body.confirmPassword
      ) {
        return res.status(400).json({
          error: 'Os campos não podem estar vazios.',
        });
      }

      if (!isEmail(req.body.email)) {
        return res.status(400).json({
          error: 'E-mail inválido.',
        });
      }

      const emailExists = await knex('users')
        .select('email')
        .where('email', '=', req.body.email);

      if (emailExists.length > 0) {
        return res.status(400).json({
          error: 'E-mail já cadastrado.',
        });
      }

      if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({
          error: 'As senhas não são iguais.',
        });
      }

      if (req.body.password.length < 8 && req.body.confirmPassword.length < 8) {
        return res.status(400).json({
          error: 'A senha deve ter no mínimo 8 caracteres.',
        });
      }

      const newUser = {
        id: v4(),
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email,
        password: hashSync(req.body.password, 8),
      };

      await knex('users').insert(newUser);

      return res.json('Usuário cadastrado com sucesso.');
    } catch (err) {
      if (err instanceof Error) {
        return res.status(400).json({
          error: err.message,
        });
      }
    }
  }
}

export default new UsersController();
