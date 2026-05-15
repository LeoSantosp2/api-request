import usersController from '../../controllers/users-controller';

import * as usersService from '../../services/users-service';
import { RequestProps } from '../../interfaces/request-props';
import { UserRequestProps } from '../../interfaces/users-props';
import { Response } from 'express';
import { UsersBodyProps } from '../../types/users-body-props';

jest.mock('../../services/users-service', () => ({
  listAll: jest.fn(),
  listOne: jest.fn(),
  create: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
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

  it('listAll returns users as json', async () => {
    (usersService.listAll as jest.Mock).mockResolvedValueOnce([{ id: '1' }]);

    const res = createMockRes();
    const req = {} as RequestProps;

    await usersController.listAll(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith([{ id: '1' }]);
  });

  it('listOne returns user as json', async () => {
    (usersService.listOne as jest.Mock).mockResolvedValueOnce({ id: '1' });

    const res = createMockRes();
    const req = { params: { id: '1' } } as unknown as RequestProps;

    await usersController.listOne(req, res as unknown as Response);

    expect(usersService.listOne).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith({ id: '1' });
  });

  it('create returns 201 and success message', async () => {
    (usersService.create as jest.Mock).mockResolvedValueOnce(undefined);

    const res = createMockRes();
    const req = { body: {} } as RequestProps<UserRequestProps>;

    await usersController.create(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Usuário criado com sucesso.',
    });
  });

  it('updateUser returns 200 and success message', async () => {
    (usersService.updateUser as jest.Mock).mockResolvedValueOnce(undefined);

    const res = createMockRes();
    const req = {
      params: { id: '1' },
      body: {},
    } as unknown as RequestProps<UserRequestProps>;

    await usersController.updateUser(req, res as unknown as Response);

    expect(usersService.updateUser).toHaveBeenCalledWith({}, '1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Usuário atualizado com sucesso.',
    });
  });

  it('deleteUser returns 200 and success message', async () => {
    (usersService.deleteUser as jest.Mock).mockResolvedValueOnce(undefined);

    const res = createMockRes();
    const req = {
      params: { id: '1' },
      body: {} as UsersBodyProps,
    } as unknown as RequestProps<UsersBodyProps>;

    await usersController.deleteUser(req, res as unknown as Response);

    expect(usersService.deleteUser).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Usuário deletado com sucesso.',
    });
  });
});
