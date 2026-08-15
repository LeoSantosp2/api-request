import { prisma } from './prisma.config';

import {
  CreateUserData,
  UpdateUserData,
  UserRepository,
} from '../../domain/users/user';

const publicSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  created_at: true,
  updated_at: true,
};

export class PrismaRepository implements UserRepository {
  async listAll() {
    return await prisma.users.findMany({ select: publicSelect });
  }

  async listOne(id: string) {
    return await prisma.users.findFirst({ where: { id } });
  }

  async listPublic(id: string) {
    return await prisma.users.findFirst({
      select: publicSelect,
      where: { id },
    });
  }

  async showByEmail(email: string) {
    return await prisma.users.findFirst({ where: { email } });
  }

  async create(newUser: CreateUserData) {
    await prisma.users.create({ data: newUser });
  }

  async update(id: string, user: UpdateUserData) {
    await prisma.users.update({ data: user, where: { id } });
  }

  async delete(id: string) {
    await prisma.users.delete({ where: { id } });
  }
}
