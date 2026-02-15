import { compareSync } from 'bcrypt';

import prisma from '../config/prisma';

export const passwordIsValid = async (email: string, password: string) => {
  const user = await prisma.users.findFirst({ where: { email } });

  if (!user) return;

  return compareSync(password, user.password);
};
