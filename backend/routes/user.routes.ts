import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import { getUser, updateUser } from '../controllers/user.controller';

const router = Router();

router.get('/user', authenticate, getUser);
router.patch('/user', authenticate, updateUser);

export default router;
