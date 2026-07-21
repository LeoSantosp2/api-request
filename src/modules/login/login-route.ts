import { Router } from 'express';

import loginController from './login-controller';

import { validateBody } from '../../middleware/validate-body';
import { loginRateLimit } from '../../middleware/login-rate-limit';

import { loginRequestSchema } from './login-schema';

const router = Router();

router.post(
  '/login',
  loginRateLimit,
  validateBody(loginRequestSchema),
  loginController.loginUser,
);

export default router;
