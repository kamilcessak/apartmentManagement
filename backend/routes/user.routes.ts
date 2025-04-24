import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import { getUser } from '../controllers/user.controller';

const router = Router();

router.get('/user', authenticate, getUser);

export default router;
