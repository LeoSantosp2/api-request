import { Router } from 'express';

import { PrismaUsersRepository } from '../../infrastructure/repositories/prisma.users.repository';
import { PrismaRefreshTokenRepository } from '../../infrastructure/repositories/prisma.refresh.token.repository';

import { LoginUseCase } from '../../application/use-case/auth/login.useCase';
import { RefreshTokenUseCase } from '../../application/use-case/auth/refreshToken.useCase';
import { LogoutUseCase } from '../../application/use-case/auth/logout.useCase';

import { LoginController } from '../controllers/login';
import { RefreshTokenController } from '../controllers/refresh.token.controller';

import { validateBody } from '../middleware/validate.body';
import { loginRateLimit } from '../middleware/login.rate.limit';

import { loginRequestSchema } from '../../domain/schemas/login.schema';
import { refreshTokenSchema } from '../../domain/schemas/refresh.token.schema';

const router = Router();

const usersRepository = new PrismaUsersRepository();
const refreshTokenRepository = new PrismaRefreshTokenRepository();

const loginUseCase = new LoginUseCase(usersRepository, refreshTokenRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(
  refreshTokenRepository,
  usersRepository,
);
const logoutUseCase = new LogoutUseCase(
  refreshTokenRepository,
  usersRepository,
);

const loginController = new LoginController(loginUseCase);
const refreshTokenController = new RefreshTokenController(
  refreshTokenUseCase,
  logoutUseCase,
);

router.post(
  '/auth/login',
  loginRateLimit,
  validateBody(loginRequestSchema),
  loginController.POST,
);

router.post(
  '/auth/refresh-token',
  validateBody(refreshTokenSchema),
  refreshTokenController.REFRESH,
);

router.post(
  '/auth/logout',
  validateBody(refreshTokenSchema),
  refreshTokenController.LOGOUT,
);

export default router;
