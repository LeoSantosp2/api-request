import { Router } from 'express';

import usersController from '../controllers/users-controller';

const router = Router();

router.get('/', usersController.index);
router.get('/:id', usersController.show);

export default router;
