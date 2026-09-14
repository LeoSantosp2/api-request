import { Response } from 'express';

import { LoginUseCase } from '../../application/use-case/login/login.useCase';

import { RequestProps } from '../../domain/interfaces/request.props';

interface LoginRequestData {
  email: string;
  password: string;
}

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
