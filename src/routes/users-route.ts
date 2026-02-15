import { Router } from 'express';

import usersController from '../controllers/users-controller';

import { loginRequired } from '../middleware/login-required';

const router = Router();

router.get('/users', usersController.listAll);
router.get('/users/:id', usersController.listOne);
router.post('/users', usersController.create);
router.put('/users/:id', loginRequired, usersController.updateUser);
router.delete('/users/:id', loginRequired, usersController.deleteUser);

export default router;
