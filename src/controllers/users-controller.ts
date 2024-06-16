import isEmail from 'validator/lib/isEmail';
import { Request, Response } from 'express';
import { v4 } from 'uuid';
import { hashSync } from 'bcrypt';

import knex from '../config/knex';

class UsersController {
  async index(req: Request, res: Response) {
    try {
      const users = await knex('users').select('*');

      return res.json(users);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  async show(req: Request, res: Response) {
    try {
      const user = await knex('users')
        .select('*')
        .where('id', '=', req.params.id);

      return res.json(user);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
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
        .where('email', '=', req.body.email)
        .first();

      if (emailExists) {
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

      return res.status(201).json('Usuário cadastrado com sucesso.');
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = await knex('users')
        .select('*')
        .where('id', '=', req.params.id)
        .first();

      if (!user) {
        return res.status(400).json({
          error: 'Usuário não existe.',
        });
      }

      if (
        user.first_name !== req.body.firstName &&
        user.last_name !== req.body.lastName
      ) {
        await knex('users')
          .update({
            first_name: req.body.firstName,
            last_name: req.body.lastName,
          })
          .where('id', '=', req.params.id);

        return res.json('Nome e Sobrenome alterados com sucesso.');
      }

      if (user[0].first_name !== req.body.firstName) {
        await knex('users')
          .update({ first_name: req.body.firstName })
          .where('id', '=', req.params.id);

        return res.json('Nome alterado com sucesso.');
      }

      if (user[0].last_name !== req.body.lastName) {
        await knex('users')
          .update({ last_name: req.body.lastName })
          .where('id', '=', req.params.id);

        return res.json('Sobrenome alterado com sucesso.');
      }

      return res.json('Nenhuma alteração efetuada.');
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const user = await knex('users')
        .select('*')
        .where('id', '=', req.params.id)
        .first();

      if (!user) {
        return res.status(400).json({
          error: 'Usuário não existe.',
        });
      }

      await knex('users').delete().where('id', '=', req.params.id);

      return res.json('Usuário excluido com sucesso.');
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }
}

export default new UsersController();
