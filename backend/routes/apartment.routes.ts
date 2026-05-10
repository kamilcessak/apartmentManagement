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
import { requireRole } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
    apartmentCreateBodySchema,
    apartmentPatchBodySchema,
} from '../validation/schemas';

const router = Router();

router.post(
    '/apartment',
    authenticate,
    requireRole('Landlord'),
    validateBody(apartmentCreateBodySchema),
    createApartment
);
router.get('/apartments', authenticate, requireRole('Landlord'), getApartments);
router.get(
    '/apartmentsList',
    authenticate,
    requireRole('Landlord'),
    getApartmentsList
);
router.get(
    '/apartment/:id',
    authenticate,
    requireRole('Landlord'),
    getApartment
);
router.delete(
    '/apartment/:id',
    authenticate,
    requireRole('Landlord'),
    deleteApartment
);
router.patch(
    '/apartment/:id',
    authenticate,
    requireRole('Landlord'),
    validateBody(apartmentPatchBodySchema),
    patchApartment
);

export default router;
