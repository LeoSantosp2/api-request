import { Router } from 'express';

import { PrismaUsersRepository } from '../../infrastructure/repositories/prisma.users.repository';
import { PrismaRefreshTokenRepository } from '../../infrastructure/repositories/prisma.refresh.token.repository';

import { LoginUseCase } from '../../application/use-case/auth/login.useCase';

import { LoginController } from '../controllers/login';

import { validateBody } from '../middleware/validate.body';
import { loginRateLimit } from '../middleware/login.rate.limit';

import { loginRequestSchema } from '../../domain/schemas/login.schema';

const router = Router();

const userRepository = new PrismaUsersRepository();
const refreshTokenRepository = new PrismaRefreshTokenRepository();

const loginUseCase = new LoginUseCase(userRepository, refreshTokenRepository);

const loginController = new LoginController(loginUseCase);

router.post(
  '/login',
  loginRateLimit,
  validateBody(loginRequestSchema),
  loginController.POST,
);

export default router;
