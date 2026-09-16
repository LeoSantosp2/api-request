import { Request, Response } from 'express';

import { RefreshTokenUseCase } from '../../application/use-case/auth/refreshToken.useCase';
import { LogoutUseCase } from '../../application/use-case/auth/logout.useCase';

export class RefreshTokenController {
  constructor(
    protected readonly refreshTokenUseCase: RefreshTokenUseCase,
    protected readonly logoutUseCase: LogoutUseCase,
  ) {}

  REFRESH = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const newRefreshToken =
      await this.refreshTokenUseCase.execute(refreshToken);

    return res.json(newRefreshToken);
  };

  LOGOUT = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    await this.logoutUseCase.execute(refreshToken);

    return res.status(204).send();
  };
}
