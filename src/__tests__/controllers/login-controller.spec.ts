import loginController from '../../controllers/login-controller';

import * as loginService from '../../services/login-service';
import { RequestProps } from '../../interfaces/request-props';
import { LoginRequest } from '../../interfaces/login-request';
import { Response } from 'express';

jest.mock('../../services/login-service', () => ({
  loginUser: jest.fn(),
}));

type MockRes = {
  json: jest.Mock;
};

describe('Testing Login Controller', () => {
  const createMockRes = (): MockRes => {
    const json = jest.fn();
    return { json };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loginUser returns service result as json', async () => {
    (loginService.loginUser as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'a@a.com',
      token: 't',
    });

    const res = createMockRes();
    const req = {
      body: { email: 'a@a.com', password: '123' },
    } as RequestProps<LoginRequest>;

    await loginController.loginUser(req, res as unknown as Response);

    expect(loginService.loginUser).toHaveBeenCalledWith({
      email: 'a@a.com',
      password: '123',
    });
    expect(res.json).toHaveBeenCalledWith({
      id: '1',
      email: 'a@a.com',
      token: 't',
    });
  });
});
