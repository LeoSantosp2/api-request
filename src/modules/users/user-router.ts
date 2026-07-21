import { Router } from 'express';

import { usersController } from './user-controller';

import { loginRequired } from '../../middleware/login-required';
import { validateBody } from '../../middleware/validate-body';

import { userRequestSchema } from './user-schema';

const router = Router();

router.get('/users', loginRequired, usersController.GET);

router.get('/users/:id', loginRequired, usersController.SHOW);

router.post('/users', validateBody(userRequestSchema), usersController.POST);

router.put(
  '/users/:id',
  loginRequired,
  validateBody(userRequestSchema),
  usersController.PUT,
);

router.delete('/users/:id', loginRequired, usersController.DELETE);

export default router;
