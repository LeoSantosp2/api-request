import { Router } from 'express';

import usersController from '../controllers/users-controller';

const router = Router();

router.get('/', usersController.index);
router.get('/:id', usersController.show);
router.post('/', usersController.store);
router.put('/:id', usersController.update);

export default router;
