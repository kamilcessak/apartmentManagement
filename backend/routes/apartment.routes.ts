import { Router } from 'express';
import {
    createApartment,
    getApartments,
} from '../controllers/apartment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/apartment', authenticate, createApartment);
router.get('/apartments', authenticate, getApartments);

export default router;
