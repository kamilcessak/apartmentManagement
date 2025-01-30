import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
    createTenant,
    deleteTenant,
    getTenant,
    getTenants,
    patchTenant,
} from '../controllers/tenant.controller';

const router = Router();

router.post('/tenant', authenticate, createTenant);
router.get('/tenants', authenticate, getTenants);
router.get('/tenant/:id', authenticate, getTenant);
router.delete('/tenant/:id', authenticate, deleteTenant);
router.patch('/tenant/:id', authenticate, patchTenant);

export default router;
