import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import {
    createRental,
    deleteRental,
    getRental,
    getRentals,
    patchRental,
} from '../controllers/rental.controller';

const router = Router();

router.post('/rental', authenticate, createRental);
router.get('/rentals', authenticate, getRentals);
router.get('/rental/:id', authenticate, getRental);
router.delete('/rental/:id', authenticate, deleteRental);
router.patch('/rental/:id', authenticate, patchRental);

export default router;
