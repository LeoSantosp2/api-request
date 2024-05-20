import { Router } from 'express';

import usersController from '../controllers/users-controller';

import { loginRequired } from '../midleware/login-required';

const router = Router();

router.get('/', usersController.index);
router.get('/:id', usersController.show);
router.post('/', usersController.store);
router.put('/:id', loginRequired, usersController.update);
router.delete('/:id', loginRequired, usersController.delete);

export default router;
