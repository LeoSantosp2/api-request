import loginController from '../../src/modules/login/login-controller';

import { service as loginService } from '../../src/modules/login/login-service';
import { RequestProps } from '../../src/interfaces/request-props';
import { LoginRequest } from '../../src/interfaces/login-request';
import { Response } from 'express';

jest.mock('../../src/modules/login/login-service', () => ({
  service: {
    login: jest.fn(),
  },
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
    (loginService.login as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'a@a.com',
      token: 't',
    });

    const res = createMockRes();
    const req = {
      body: { email: 'a@a.com', password: '123' },
    } as RequestProps<LoginRequest>;

    await loginController.loginUser(req, res as unknown as Response);

    expect(loginService.login).toHaveBeenCalledWith({
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
