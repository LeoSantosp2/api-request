import prisma from '../config/prisma';

import { CreateUsersProps } from '../interfaces/users-props';

const publicSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  created_at: true,
  updated_at: true,
};

export const index = async () =>
  await prisma.users.findMany({ select: publicSelect });

export const show = async (id: string) =>
  await prisma.users.findFirst({ where: { id } });

export const showPublic = async (id: string) =>
  await prisma.users.findFirst({ where: { id }, select: publicSelect });

export const showByEmail = async (email: string) =>
  await prisma.users.findFirst({ where: { email } });

export const store = async (user: CreateUsersProps) =>
  await prisma.users.create({ data: user });

export const update = async (user: CreateUsersProps, id: string) =>
  await prisma.users.update({ data: user, where: { id } });

export const IDelete = async (id: string) =>
  await prisma.users.delete({ where: { id } });
