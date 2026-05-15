import prisma from '../../config/prisma';

import {
  index,
  show,
  showByEmail,
  store,
  update,
  IDelete,
} from '../../repositories/users-repository';
import { CreateUsersProps } from '../../interfaces/users-props';

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

describe('Testing Users Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('index calls prisma.users.findMany', async () => {
    (prisma.users.findMany as jest.Mock).mockResolvedValueOnce([{ id: '1' }]);

    const result = await index();

    expect(prisma.users.findMany).toHaveBeenCalledWith();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('show calls prisma.users.findFirst with id', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({ id: '1' });

    const result = await show('1');

    expect(prisma.users.findFirst).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual({ id: '1' });
  });

  it('showByEmail calls prisma.users.findFirst with email', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'a@a.com',
    });

    const result = await showByEmail('a@a.com');

    expect(prisma.users.findFirst).toHaveBeenCalledWith({
      where: { email: 'a@a.com' },
    });
    expect(result).toEqual({ id: '1', email: 'a@a.com' });
  });

  it('store calls prisma.users.create with data', async () => {
    (prisma.users.create as jest.Mock).mockResolvedValueOnce({ id: '1' });

    const user: CreateUsersProps = {
      id: '1',
      first_name: 'A',
      last_name: 'B',
      email: 'a@a.com',
      password: 'hashed',
    };

    await store(user);

    expect(prisma.users.create).toHaveBeenCalledWith({ data: user });
  });

  it('update calls prisma.users.update with data and where', async () => {
    (prisma.users.update as jest.Mock).mockResolvedValueOnce({ id: '1' });

    const user: CreateUsersProps = {
      id: '1',
      first_name: 'A',
      last_name: 'B',
      email: 'new@a.com',
      password: 'hashed',
    };
    await update(user, '1');

    expect(prisma.users.update).toHaveBeenCalledWith({
      data: user,
      where: { id: '1' },
    });
  });

  it('IDelete calls prisma.users.delete with id', async () => {
    (prisma.users.delete as jest.Mock).mockResolvedValueOnce({ id: '1' });

    await IDelete('1');

    expect(prisma.users.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
