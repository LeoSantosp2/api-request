import prisma from '../../config/prisma';

import { NewUser } from '../../types/users-props';

const publicSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  created_at: true,
  updated_at: true,
};

export const repository = {
  async get() {
    const users = await prisma.users.findMany({ select: publicSelect });

    return users;
  },

  async show(id: string) {
    const user = await prisma.users.findFirst({
      where: { id },
    });

    return user;
  },

  async showPublic(id: string) {
    const user = await prisma.users.findFirst({
      select: publicSelect,
      where: { id },
    });

    return user;
  },

  async showByEmail(email: string) {
    const user = await prisma.users.findFirst({ where: { email } });

    return user;
  },

  async store(newUser: NewUser) {
    await prisma.users.create({ data: newUser });
  },

  async update(id: string, user: NewUser) {
    await prisma.users.update({ data: user, where: { id } });
  },

  async delete(id: string) {
    await prisma.users.delete({ where: { id } });
  },
};
