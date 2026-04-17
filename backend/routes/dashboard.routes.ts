import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { getDashboard } from '../controllers/dashboard.controller';

const router = Router();

router.get('/dashboard', authenticate, requireRole('Landlord'), getDashboard);

export default router;
