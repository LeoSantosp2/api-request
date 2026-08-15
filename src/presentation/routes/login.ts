import { Router } from 'express';

import { PrismaRepository } from '../../infraestructure/database/prisma.users.repository';

import { LoginUseCase } from '../../application/login/login.useCase';

import { LoginController } from '../controllers/login';

import { validateBody } from '../../middleware/validate-body';

import { loginRequestSchema } from '../../domain/login/login.schema';

const router = Router();

const userRepository = new PrismaRepository();

const loginUseCase = new LoginUseCase(userRepository);

const loginController = new LoginController(loginUseCase);

router.post('/login', validateBody(loginRequestSchema), loginController.POST);

export default router;
