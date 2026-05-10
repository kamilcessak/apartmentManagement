import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import {
    invoiceCreateBodySchema,
    invoicePatchBodySchema,
    invoicesListQuerySchema,
} from '../validation/schemas';
import {
    createInvoice,
    deleteInvoice,
    getInvoice,
    getInvoices,
    getInvoicesByApartment,
    patchInvoice,
} from '../controllers/invoice.controller';

const router = Router();

router.post(
    '/invoice',
    authenticate,
    requireRole('Landlord'),
    validateBody(invoiceCreateBodySchema),
    createInvoice
);
router.get(
    '/invoices',
    authenticate,
    requireRole('Landlord'),
    validateQuery(invoicesListQuerySchema),
    getInvoices
);
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
    validateBody(invoicePatchBodySchema),
    patchInvoice
);
router.get(
    '/apartment/:id/invoices',
    authenticate,
    requireRole('Landlord'),
    getInvoicesByApartment
);

export default router;
