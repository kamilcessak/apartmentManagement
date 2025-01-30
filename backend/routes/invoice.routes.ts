import { Router } from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import {
    createInvoice,
    deleteInvoice,
    getInvoice,
    getInvoices,
    patchInvoice,
} from '../controllers/invoice.controller';

const router = Router();

router.post('/invoice', authenticate, createInvoice);
router.get('/invoices', authenticate, getInvoices);
router.get('/invoice/:id', authenticate, getInvoice);
router.delete('/invoice/:id', authenticate, deleteInvoice);
router.patch('/invoice/:id', authenticate, patchInvoice);

export default router;
