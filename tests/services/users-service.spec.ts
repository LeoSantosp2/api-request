/* eslint-disable prettier/prettier */
import prisma from '../../src/config/prisma';

import { service } from '../../src/modules/users/user-service';

import { HttpError } from '../../src/utils/http-error';

jest.mock('uuid', () => ({
  v4: () => 'fixed-uuid',
}));

jest.mock('bcrypt', () => ({
  hashSync: jest.fn(() => 'hashed-password'),
  compareSync: jest.fn(() => true),
}));

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    users: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Testing Users Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should return all users', async () => {
    (prisma.users.findMany as jest.Mock).mockResolvedValue([]);

    const users = await service.listAll();

    expect(users).toEqual([]);
  });

  it('Should return a user', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
      name: 'Leonardo',
      email: 'leonardo@email.com',
    });

    const user = await service.listOne('1');

    expect(user).toEqual({
      id: '1',
      name: 'Leonardo',
      email: 'leonardo@email.com',
    });
  });

  it('Should return error "404 - Usuário não encontrado"', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const promise = service.listOne('2');

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Usuário não encontrado ou não existe.',
    );
  });

  it('Should return error when creating with existing email', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'existing',
      email: 'leonardo@email.com',
    });

    const promise = service.create({
      firstName: 'Leonardo',
      lastName: 'Santos',
      email: 'leonardo@email.com',
      password: '12345678',
      confirmPassword: '12345678',
    });

    await expect(promise).rejects.toMatchObject({ statusCode: 400 });
    await expect(promise).rejects.toHaveProperty('message', 'Dados inválidos.');
  });

  it('Should create a user', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.users.create as jest.Mock).mockResolvedValueOnce({});

    await expect(
      service.create({
        firstName: 'Leonardo',
        lastName: 'Santos',
        email: 'leonardo@email.com',
        password: '12345678',
        confirmPassword: '12345678',
      }),
    ).resolves.toBeUndefined();

    expect(prisma.users.create).toHaveBeenCalledWith({
      data: {
        id: 'fixed-uuid',
        first_name: 'Leonardo',
        last_name: 'Santos',
        email: 'leonardo@email.com',
        password: 'hashed-password',
      },
    });
  });

  it('Should return error when requester is not the target user', async () => {
    const promise = service.update(
      {
        firstName: 'New',
        lastName: 'Name',
        email: 'old@email.com',
        password: '12345678',
        confirmPassword: '12345678',
      },
      '1',
      'someone-else',
    );

    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Você não tem permissão para editar este usuário.',
    );
    expect(prisma.users.findFirst).not.toHaveBeenCalled();
  });

  it('Should return error when updating a missing user', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const promise = service.update(
      {
        firstName: 'New',
        lastName: 'Name',
        email: 'new@email.com',
        password: '12345678',
        confirmPassword: '12345678',
      },
      '1',
      '1',
    );

    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Usuário não encontrado ou não existe.',
    );
  });

  it('Should update a user in place without persisting via the repository', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
      first_name: 'Old',
      last_name: 'Name',
      email: 'old@email.com',
      password: 'hashed-password',
    });

    await expect(
      service.update(
        {
          firstName: 'New',
          lastName: 'Name',
          email: 'old@email.com',
          password: '12345678',
          confirmPassword: '12345678',
        },
        '1',
        '1',
      ),
    ).resolves.toBeUndefined();

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('Should return error when updating to an email already in use', async () => {
    (prisma.users.findFirst as jest.Mock)
      .mockResolvedValueOnce({
        id: '1',
        first_name: 'Old',
        last_name: 'Name',
        email: 'old@email.com',
        password: 'hashed-password',
      })
      .mockResolvedValueOnce({ id: 'other', email: 'new@email.com' });

    const promise = service.update(
      {
        firstName: 'Old',
        lastName: 'Name',
        email: 'new@email.com',
        password: '12345678',
        confirmPassword: '12345678',
      },
      '1',
      '1',
    );

    await expect(promise).rejects.toMatchObject({ statusCode: 400 });
    await expect(promise).rejects.toHaveProperty('message', 'Dados inválidos.');
  });

  it('Should return error when requester is not the user being deleted', async () => {
    const promise = service.delete('1', 'someone-else');

    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Você não tem permissão para deletar este usuário.',
    );
    expect(prisma.users.delete).not.toHaveBeenCalled();
  });

  it('Should resolve when requester is the user being deleted', async () => {
    await expect(service.delete('1', '1')).resolves.toBeUndefined();
  });
});
