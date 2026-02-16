import { Response } from 'express';

import {
  listAll,
  listOne,
  create,
  updateUser,
  deleteUser,
} from '../services/users-service';

import { RequestProps } from '../interfaces/request-props';
import { UserRequestProps } from '../interfaces/users-props';
import { UsersBodyProps } from '../types/users-body-props';

class UsersController {
  async listAll(req: RequestProps, res: Response) {
    const users = await listAll();

    return res.json(users);
  }

  async listOne(req: RequestProps, res: Response) {
    const user = await listOne(req.params.id);

    return res.json(user);
  }

  async create(req: RequestProps<UserRequestProps>, res: Response) {
    await create(req.body);

    return res.status(201).json({
      status: 'success',
      message: 'Usuário criado com sucesso.',
    });
  }

  async updateUser(req: RequestProps<UserRequestProps>, res: Response) {
    await updateUser(req.body, req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Usuário atualizado com sucesso.',
    });
  }

  async deleteUser(req: RequestProps<UsersBodyProps>, res: Response) {
    await deleteUser(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Usuário deletado com sucesso.',
    });
  }
}

export default new UsersController();
