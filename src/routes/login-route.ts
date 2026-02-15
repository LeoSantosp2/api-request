import { Router } from 'express';

import loginController from '../controllers/login-controller';

const router = Router();

router.post('/login', loginController.loginUser);

export default router;
