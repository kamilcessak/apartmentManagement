import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import {
    createInvoice,
    deleteInvoice,
    getInvoice,
    getInvoices,
    getInvoicesByApartment,
    patchInvoice,
} from '../controllers/invoice.controller';

const router = Router();

router.post('/invoice', authenticate, requireRole('Landlord'), createInvoice);
router.get('/invoices', authenticate, requireRole('Landlord'), getInvoices);
router.get('/invoice/:id', authenticate, requireRole('Landlord'), getInvoice);
router.delete(
    '/invoice/:id',
    authenticate,
    requireRole('Landlord'),
    deleteInvoice
);
router.patch(
    '/invoice/:id',
    authenticate,
    requireRole('Landlord'),
    patchInvoice
);
router.get(
    '/apartment/:id/invoices',
    authenticate,
    requireRole('Landlord'),
    getInvoicesByApartment
);

export default router;
