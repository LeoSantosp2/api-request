import prisma from '../config/prisma';

import { CreateUsersProps } from '../interfaces/users-props';

export const index = async () => await prisma.users.findMany();

export const show = async (id: string) =>
  await prisma.users.findFirst({ where: { id } });

export const showByEmail = async (email: string) =>
  await prisma.users.findFirst({ where: { email } });

export const store = async (user: CreateUsersProps) =>
  await prisma.users.create({ data: user });

export const update = async (user: CreateUsersProps, id: string) =>
  await prisma.users.update({ data: user, where: { id } });

export const IDelete = async (id: string) =>
  await prisma.users.delete({ where: { id } });
