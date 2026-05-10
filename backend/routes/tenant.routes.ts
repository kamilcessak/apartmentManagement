import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
    tenantCreateBodySchema,
    tenantPatchBodySchema,
} from '../validation/schemas';
import {
    createTenant,
    deleteTenant,
    getTenant,
    getTenants,
    patchTenant,
    getTenantsList,
    resendTenantInvitation,
} from '../controllers/tenant.controller';

const router = Router();

router.post(
    '/tenant',
    authenticate,
    requireRole('Landlord'),
    validateBody(tenantCreateBodySchema),
    createTenant
);
router.get('/tenants', authenticate, requireRole('Landlord'), getTenants);
router.get(
    '/tenantsList',
    authenticate,
    requireRole('Landlord'),
    getTenantsList
);
router.get('/tenant/:id', authenticate, requireRole('Landlord'), getTenant);
router.delete(
    '/tenant/:id',
    authenticate,
    requireRole('Landlord'),
    deleteTenant
);
router.patch(
    '/tenant/:id',
    authenticate,
    requireRole('Landlord'),
    validateBody(tenantPatchBodySchema),
    patchTenant
);
router.post(
    '/tenant/:id/invite',
    authenticate,
    requireRole('Landlord'),
    resendTenantInvitation
);

export default router;
