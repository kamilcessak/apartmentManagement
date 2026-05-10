import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { userPatchBodySchema } from '../validation/schemas';
import {
    getMyApartment,
    getMyDocuments,
    getMyInvoices,
    getUser,
    updateUser,
} from '../controllers/user.controller';

const router = Router();

router.get('/user', authenticate, getUser);
router.patch('/user', authenticate, validateBody(userPatchBodySchema), updateUser);

router.get('/me', authenticate, getUser);
router.patch('/me', authenticate, validateBody(userPatchBodySchema), updateUser);

router.get('/me/apartment', authenticate, requireRole('Tenant'), getMyApartment);
router.get('/me/invoices', authenticate, requireRole('Tenant'), getMyInvoices);
router.get('/me/documents', authenticate, requireRole('Tenant'), getMyDocuments);

export default router;
