import { Router } from 'express';
import {
    createApartment,
    deleteApartment,
    getApartment,
    getApartments,
    getApartmentsList,
    patchApartment,
} from '../controllers/apartment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/apartment', authenticate, createApartment);
router.get('/apartments', authenticate, getApartments);
router.get('/apartmentsList', authenticate, getApartmentsList);
router.get('/apartment/:id', authenticate, getApartment);
router.delete('/apartment/:id', authenticate, deleteApartment);
router.patch('/apartment/:id', authenticate, patchApartment);

export default router;
