import { Response } from 'express';

import { service } from './user-service';

import { RequestProps } from '../../interfaces/request-props';
import { UserRequest } from '../../types/users-props';

export const usersController = {
  async GET(req: RequestProps, res: Response) {
    const users = await service.listAll();

    return res.json(users);
  },

  async SHOW(req: RequestProps, res: Response) {
    const user = await service.listOne(req.params.id);

    return res.json(user);
  },

  async POST(req: RequestProps<UserRequest>, res: Response) {
    await service.create(req.body);

    return res.status(201).json({
      status: 'success',
      message: 'Usuário criado com sucesso.',
    });
  },

  async PUT(req: RequestProps<UserRequest>, res: Response) {
    await service.update(req.body, req.params.id, req.userId);

    return res.status(200).json({
      status: 'success',
      message: 'Usuário editado com sucesso.',
    });
  },

  async DELETE(req: RequestProps, res: Response) {
    await service.delete(req.params.id, req.userId);

    return res.status(200).json({
      status: 'success',
      message: 'Usuário deletado com sucesso.',
    });
  },
};
