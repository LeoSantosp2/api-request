import { Request, Response } from 'express';

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
}

export default new UsersController();
