import { mock, MockProxy } from 'jest-mock-extended';
import { Response } from 'express';

import { UsersController } from '../../src/presentation/controllers/users';
import { ListAllUseCase } from '../../src/application/users/listAll.useCase';
import { ListOneUseCase } from '../../src/application/users/listOne.useCase';
import { CreateUseCase } from '../../src/application/users/create.useCase';
import { UpdateUseCase } from '../../src/application/users/update.useCase';
import { DeleteUseCase } from '../../src/application/users/delete.useCase';
import { UserRequestData } from '../../src/domain/users/users';
import { RequestProps } from '../../src/interfaces/request.props';

type MockRes = {
  json: jest.Mock;
  status: jest.Mock;
  send: jest.Mock;
};

describe('Testing UsersController', () => {
  let listAllUseCase: MockProxy<ListAllUseCase>;
  let listOneUseCase: MockProxy<ListOneUseCase>;
  let createUseCase: MockProxy<CreateUseCase>;
  let updateUseCase: MockProxy<UpdateUseCase>;
  let deleteUseCase: MockProxy<DeleteUseCase>;
  let usersController: UsersController;

  const createMockRes = (): MockRes => {
    const json = jest.fn();
    const send = jest.fn();
    const status = jest.fn().mockImplementation(() => ({ json, send }));

    return { status, json, send };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    listAllUseCase = mock<ListAllUseCase>();
    listOneUseCase = mock<ListOneUseCase>();
    createUseCase = mock<CreateUseCase>();
    updateUseCase = mock<UpdateUseCase>();
    deleteUseCase = mock<DeleteUseCase>();
    usersController = new UsersController(
      listAllUseCase,
      createUseCase,
      listOneUseCase,
      updateUseCase,
      deleteUseCase,
    );
  });

  it('GET returns users as json', async () => {
    listAllUseCase.execute.mockResolvedValueOnce([]);

    const res = createMockRes();
    const req = {} as RequestProps;

    await usersController.GET(req, res as unknown as Response);

    expect(listAllUseCase.execute).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('SHOW returns user as json', async () => {
    listOneUseCase.execute.mockResolvedValueOnce(null);

    const res = createMockRes();
    const req = {
      params: { id: '1' },
      userId: '1',
    } as unknown as RequestProps;

    await usersController.SHOW(req, res as unknown as Response);

    expect(listOneUseCase.execute).toHaveBeenCalledWith('1', '1');
    expect(res.json).toHaveBeenCalledWith(null);
  });

  it('POST returns 201 and success message', async () => {
    createUseCase.execute.mockResolvedValueOnce(undefined);

    const res = createMockRes();
    const req = { body: {} } as RequestProps<UserRequestData>;

    await usersController.POST(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Usuário criado com sucesso.',
    });
  });

  it('PUT returns 204 with no content', async () => {
    updateUseCase.execute.mockResolvedValueOnce(undefined);

    const res = createMockRes();
    const req = {
      params: { id: '1' },
      body: {},
      userId: '1',
    } as unknown as RequestProps<UserRequestData>;

    await usersController.PUT(req, res as unknown as Response);

    expect(updateUseCase.execute).toHaveBeenCalledWith('1', {}, '1');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.status().send).toHaveBeenCalledWith();
  });

  it('DELETE returns 204 with no content', async () => {
    deleteUseCase.execute.mockResolvedValueOnce(undefined);

    const res = createMockRes();
    const req = {
      params: { id: '1' },
      userId: '1',
    } as unknown as RequestProps;

    await usersController.DELETE(req, res as unknown as Response);

    expect(deleteUseCase.execute).toHaveBeenCalledWith('1', '1');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.status().send).toHaveBeenCalledWith();
  });
});
