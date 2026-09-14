import { Router } from 'express';

import { PrismaRepository } from '../../infrastructure/repositories/prisma.users.repository';

import { ListAllUseCase } from '../../application/use-case/users/listAll.useCase';
import { CreateUseCase } from '../../application/use-case/users/create.useCase';
import { ListOneUseCase } from '../../application/use-case/users/listOne.useCase';
import { UpdateUseCase } from '../../application/use-case/users/update.useCase';
import { DeleteUseCase } from '../../application/use-case/users/delete.useCase';

import {
  userRequestSchema,
  updateRequestSchema,
} from '../../domain/schemas/user.schema';

import { UsersController } from '../controllers/user.controller';

import { loginRequired } from '../middleware/login.required';
import { validateBody } from '../middleware/validate.body';

const userRepository = new PrismaRepository();

const listAllUseCase = new ListAllUseCase(userRepository);
const createUseCase = new CreateUseCase(userRepository);
const listOneUseCase = new ListOneUseCase(userRepository);
const updateUseCase = new UpdateUseCase(userRepository);
const deleteUseCase = new DeleteUseCase(userRepository);

const usersController = new UsersController(
  listAllUseCase,
  createUseCase,
  listOneUseCase,
  updateUseCase,
  deleteUseCase,
);

const router = Router();

router.get('/users', loginRequired, usersController.GET);
router.get('/users/:id', loginRequired, usersController.SHOW);
router.post('/users', validateBody(userRequestSchema), usersController.POST);
router.put(
  '/users/:id',
  loginRequired,
  validateBody(updateRequestSchema),
  usersController.PUT,
);
router.delete('/users/:id', loginRequired, usersController.DELETE);

export default router;
