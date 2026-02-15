import prisma from '../config/prisma';

import { LoginRequest } from '../interfaces/login-request';

export const login = async (login: LoginRequest, token: string) =>
  prisma.users.update({
    data: { token_auth: token },
    where: { email: login.email },
  });
