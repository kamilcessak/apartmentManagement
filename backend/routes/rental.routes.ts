import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import {
    createRental,
    deleteRental,
    endRental,
    getRental,
    getRentals,
    patchRental,
} from '../controllers/rental.controller';

const router = Router();

router.post('/rental', authenticate, requireRole('Landlord'), createRental);
router.get('/rentals', authenticate, requireRole('Landlord'), getRentals);
router.get('/rental/:id', authenticate, requireRole('Landlord'), getRental);
router.delete(
    '/rental/:id',
    authenticate,
    requireRole('Landlord'),
    deleteRental
);
router.patch(
    '/rental/:id',
    authenticate,
    requireRole('Landlord'),
    patchRental
);
router.post(
    '/rental/:id/end',
    authenticate,
    requireRole('Landlord'),
    endRental
);

export default router;
