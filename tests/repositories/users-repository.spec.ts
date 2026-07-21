import prisma from '../../src/config/prisma';

import { repository } from '../../src/modules/users/user-repository';
import { NewUser } from '../../src/types/users-props';

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

describe('Testing Users Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const publicSelect = {
    id: true,
    first_name: true,
    last_name: true,
    email: true,
    created_at: true,
    updated_at: true,
  };

  it('get calls prisma.users.findMany with a public select', async () => {
    (prisma.users.findMany as jest.Mock).mockResolvedValueOnce([{ id: '1' }]);

    const result = await repository.get();

    expect(prisma.users.findMany).toHaveBeenCalledWith({
      select: publicSelect,
    });
    expect(result).toEqual([{ id: '1' }]);
  });

  it('show calls prisma.users.findFirst with id', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({ id: '1' });

    const result = await repository.show('1');

    expect(prisma.users.findFirst).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual({ id: '1' });
  });

  it('showPublic calls prisma.users.findFirst with id and a public select', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({ id: '1' });

    const result = await repository.showPublic('1');

    expect(prisma.users.findFirst).toHaveBeenCalledWith({
      select: publicSelect,
      where: { id: '1' },
    });
    expect(result).toEqual({ id: '1' });
  });

  it('showByEmail calls prisma.users.findFirst with email', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'a@a.com',
    });

    const result = await repository.showByEmail('a@a.com');

    expect(prisma.users.findFirst).toHaveBeenCalledWith({
      where: { email: 'a@a.com' },
    });
    expect(result).toEqual({ id: '1', email: 'a@a.com' });
  });

  it('store calls prisma.users.create with data', async () => {
    (prisma.users.create as jest.Mock).mockResolvedValueOnce({ id: '1' });

    const user: NewUser = {
      id: '1',
      first_name: 'A',
      last_name: 'B',
      email: 'a@a.com',
      password: 'hashed',
    };

    await repository.store(user);

    expect(prisma.users.create).toHaveBeenCalledWith({ data: user });
  });

  it('update calls prisma.users.update with data and where', async () => {
    (prisma.users.update as jest.Mock).mockResolvedValueOnce({ id: '1' });

    const user: NewUser = {
      id: '1',
      first_name: 'A',
      last_name: 'B',
      email: 'new@a.com',
      password: 'hashed',
    };
    await repository.update('1', user);

    expect(prisma.users.update).toHaveBeenCalledWith({
      data: user,
      where: { id: '1' },
    });
  });

  it('delete calls prisma.users.delete with id', async () => {
    (prisma.users.delete as jest.Mock).mockResolvedValueOnce({ id: '1' });

    await repository.delete('1');

    expect(prisma.users.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
