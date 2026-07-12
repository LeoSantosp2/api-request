/* eslint-disable prettier/prettier */
import prisma from '../../config/prisma';

import {
  listAll,
  listOne,
  create,
  updateUser,
  deleteUser,
} from '../../services/users-service';

import { HttpError } from '../../utils/http-error';

jest.mock('uuid', () => ({
  v4: () => 'fixed-uuid',
}));

jest.mock('bcrypt', () => ({
  hashSync: jest.fn(() => 'hashed-password'),
  compareSync: jest.fn(() => true),
}));

jest.mock('../../config/prisma', () => ({
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

    const users = await listAll();

    expect(users).toEqual([]);
  });

  it('Should return a user', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
      name: 'Leonardo',
      email: 'leonardo@email.com',
    });

    const user = await listOne('1');

    expect(user).toEqual({
      id: '1',
      name: 'Leonardo',
      email: 'leonardo@email.com',
    });
  });

  it('Should return error "404 - Usuário não encontrado"', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const promise = listOne('2');

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Usuário não encontrado.',
    );
  });

  it('Should return error when creating with existing email', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'existing',
      email: 'leonardo@email.com',
    });

    const promise = create({
      firstName: 'Leonardo',
      lastName: 'Santos',
      email: 'leonardo@email.com',
      password: '12345678',
      confirmPassword: '12345678',
    });

    await expect(promise).rejects.toMatchObject({ statusCode: 400 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'E-mail já cadastrado.',
    );
  });

  it('Should create a user', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.users.create as jest.Mock).mockResolvedValueOnce({});

    await expect(
      create({
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

  it('Should return error when updating a missing user', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const promise = updateUser(
      {
        firstName: 'New',
        lastName: 'Name',
        email: 'new@email.com',
        password: '12345678',
        confirmPassword: '12345678',
      },
      'missing',
    );

    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Usuário não encontrado.',
    );
  });

  it('Should return error when requester is not the target user', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
      first_name: 'Old',
      last_name: 'Name',
      email: 'old@email.com',
      password: 'hashed-password',
    });

    const promise = updateUser(
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
      'Você não tem permissão para alterar este usuário.',
    );
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('Should update password when it has changed', async () => {
    const bcrypt = await import('bcrypt');
    (bcrypt.compareSync as unknown as jest.Mock).mockReturnValueOnce(false);

    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
      first_name: 'Old',
      last_name: 'Name',
      email: 'old@email.com',
      password: 'old-hash',
    });
    (prisma.users.update as jest.Mock).mockResolvedValueOnce({});

    await expect(
      updateUser(
        {
          firstName: 'Old',
          lastName: 'Name',
          email: 'old@email.com',
          password: '12345678',
          confirmPassword: '12345678',
        },
        '1',
        '1',
      ),
    ).resolves.toBeUndefined();

    expect(prisma.users.update).toHaveBeenCalledTimes(1);
  });

  it('Should update a user', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
      first_name: 'Old',
      last_name: 'Name',
      email: 'old@email.com',
      password: 'hashed-password',
    });

    (prisma.users.update as jest.Mock).mockResolvedValueOnce({});

    await expect(
      updateUser(
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

    expect(prisma.users.update).toHaveBeenCalledTimes(1);
  });

  it('Should return error when deleting a missing user', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const promise = deleteUser('missing', 'missing');

    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Usuário não encontrado.',
    );
  });

  it('Should return error when requester is not the user being deleted', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'email@email.com',
    });

    const promise = deleteUser('1', 'someone-else');

    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Você não tem permissão para deletar este usuário.',
    );
    expect(prisma.users.delete).not.toHaveBeenCalled();
  });

  it('Should delete a user', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'email@email.com',
    });

    (prisma.users.delete as jest.Mock).mockResolvedValueOnce({});

    await expect(deleteUser('1', '1')).resolves.toBeUndefined();
    expect(prisma.users.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
