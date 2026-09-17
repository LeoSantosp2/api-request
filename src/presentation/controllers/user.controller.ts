import { Response } from 'express';

import { ListAllUseCase } from '../../application/use-case/users/listAll.useCase';
import { ListOneUseCase } from '../../application/use-case/users/listOne.useCase';
import { CreateUseCase } from '../../application/use-case/users/create.useCase';
import { UpdateUseCase } from '../../application/use-case/users/update.useCase';
import { DeleteUseCase } from '../../application/use-case/users/delete.useCase';

import {
  CreateUserRequestData,
  UpdateRequestUserData,
} from '../../domain/entities/users.entity';

import { RequestProps } from '../../domain/interfaces/request.props';

export class UsersController {
  constructor(
    protected readonly listAllUseCase: ListAllUseCase,
    protected readonly createUseCase: CreateUseCase,
    protected readonly listOneUseCase: ListOneUseCase,
    protected readonly updateUseCase: UpdateUseCase,
    protected readonly deleteUseCase: DeleteUseCase,
  ) {}

  GET = async (req: RequestProps, res: Response) => {
    const users = await this.listAllUseCase.execute();

    return res.json(users);
  };

  SHOW = async (req: RequestProps, res: Response) => {
    const user = await this.listOneUseCase.execute(req.params.id, req.userId);

    return res.json(user);
  };

  POST = async (req: RequestProps<CreateUserRequestData>, res: Response) => {
    await this.createUseCase.execute(req.body);

    return res.status(201).json({
      status: 'success',
      message: 'Usuário criado com sucesso.',
    });
  };

  PUT = async (req: RequestProps<UpdateRequestUserData>, res: Response) => {
    await this.updateUseCase.execute(req.params.id, req.body, req.userId);

    return res.status(204).send();
  };

  DELETE = async (req: RequestProps, res: Response) => {
    await this.deleteUseCase.execute(req.params.id, req.userId);

    return res.status(204).send();
  };
}
