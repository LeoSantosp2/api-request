import { mock, MockProxy } from 'jest-mock-extended';
import { Response } from 'express';

import { LoginController } from '../../src/presentation/controllers/login';
import { LoginUseCase } from '../../src/application/login/login.useCase';
import { LoginRequestData } from '../../src/domain/login/login';
import { RequestProps } from '../../src/interfaces/request-props';

type MockRes = { json: jest.Mock };

describe('Testing LoginController', () => {
  let loginUseCase: MockProxy<LoginUseCase>;
  let loginController: LoginController;

  const createMockRes = (): MockRes => ({ json: jest.fn() });

  beforeEach(() => {
    jest.clearAllMocks();
    loginUseCase = mock<LoginUseCase>();
    loginController = new LoginController(loginUseCase);
  });

  it('POST returns use case result as json', async () => {
    loginUseCase.execute.mockResolvedValueOnce({
      id: '1',
      email: 'a@a.com',
      token: 't',
    });

    const res = createMockRes();
    const req = {
      body: { email: 'a@a.com', password: '123' },
    } as RequestProps<LoginRequestData>;

    await loginController.POST(req, res as unknown as Response);

    expect(loginUseCase.execute).toHaveBeenCalledWith('a@a.com', '123');
    expect(res.json).toHaveBeenCalledWith({
      id: '1',
      email: 'a@a.com',
      token: 't',
    });
  });
});
