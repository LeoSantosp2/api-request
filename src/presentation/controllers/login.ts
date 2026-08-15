import { Response } from 'express';

import { LoginRequestData } from '../../domain/login/login';

import { LoginUseCase } from '../../application/login/login.useCase';

import { RequestProps } from '../../interfaces/request-props';

export class LoginController {
  constructor(protected readonly loginUseCase: LoginUseCase) {}

  POST = async (req: RequestProps<LoginRequestData>, res: Response) => {
    const login = await this.loginUseCase.execute(
      req.body.email,
      req.body.password,
    );

    return res.json(login);
  };
}
