import { Router } from 'express';

import { PrismaRepository } from '../../infrastructure/repositories/prisma.users.repository';

import { LoginUseCase } from '../../application/use-case/login/login.useCase';

import { LoginController } from '../controllers/login';

import { validateBody } from '../middleware/validate.body';
import { loginRateLimit } from '../middleware/login.rate.limit';

import { loginRequestSchema } from '../../domain/schemas/login.schema';

const router = Router();

const userRepository = new PrismaRepository();

const loginUseCase = new LoginUseCase(userRepository);

const loginController = new LoginController(loginUseCase);

router.post(
  '/login',
  loginRateLimit,
  validateBody(loginRequestSchema),
  loginController.POST,
);

export default router;
