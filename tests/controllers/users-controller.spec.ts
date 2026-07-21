import { usersController } from '../../src/modules/users/user-controller';

import { service as usersService } from '../../src/modules/users/user-service';
import { RequestProps } from '../../src/interfaces/request-props';
import { UserRequest } from '../../src/types/users-props';
import { Response } from 'express';

jest.mock('../../src/modules/users/user-service', () => ({
  service: {
    listAll: jest.fn(),
    listOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

type MockRes = {
  json: jest.Mock;
  status: jest.Mock;
};

describe('Testing Users Controller', () => {
  const createMockRes = (): MockRes => {
    const json = jest.fn();
    const status = jest.fn().mockImplementation(() => ({ json }));

    return { status, json };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns users as json', async () => {
    (usersService.listAll as jest.Mock).mockResolvedValueOnce([{ id: '1' }]);

    const res = createMockRes();
    const req = {} as RequestProps;

    await usersController.GET(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith([{ id: '1' }]);
  });

  it('SHOW returns user as json', async () => {
    (usersService.listOne as jest.Mock).mockResolvedValueOnce({ id: '1' });

    const res = createMockRes();
    const req = { params: { id: '1' } } as unknown as RequestProps;

    await usersController.SHOW(req, res as unknown as Response);

    expect(usersService.listOne).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith({ id: '1' });
  });

  it('POST returns 201 and success message', async () => {
    (usersService.create as jest.Mock).mockResolvedValueOnce(undefined);

    const res = createMockRes();
    const req = { body: {} } as RequestProps<UserRequest>;

    await usersController.POST(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Usuário criado com sucesso.',
    });
  });

  it('PUT returns 200 and success message', async () => {
    (usersService.update as jest.Mock).mockResolvedValueOnce(undefined);

    const res = createMockRes();
    const req = {
      params: { id: '1' },
      body: {},
      userId: '1',
    } as unknown as RequestProps<UserRequest>;

    await usersController.PUT(req, res as unknown as Response);

    expect(usersService.update).toHaveBeenCalledWith({}, '1', '1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Usuário editado com sucesso.',
    });
  });

  it('DELETE returns 200 and success message', async () => {
    (usersService.delete as jest.Mock).mockResolvedValueOnce(undefined);

    const res = createMockRes();
    const req = {
      params: { id: '1' },
      body: undefined,
      userId: '1',
    } as unknown as RequestProps;

    await usersController.DELETE(req, res as unknown as Response);

    expect(usersService.delete).toHaveBeenCalledWith('1', '1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Usuário deletado com sucesso.',
    });
  });
});
