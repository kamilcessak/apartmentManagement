import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import { getDashboard } from '../controllers/dashboard.controller';

const router = Router();

router.get('/dashboard', authenticate, getDashboard);

export default router;
