import { Response } from 'express';

import { service } from './login-service';

import { RequestProps } from '../../interfaces/request-props';
import { LoginRequest } from '../../interfaces/login-request';

class LoginController {
  async loginUser(req: RequestProps<LoginRequest>, res: Response) {
    const userDatas = await service.login(req.body);

    return res.json(userDatas);
  }
}

export default new LoginController();
