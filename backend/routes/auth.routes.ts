import { Router } from 'express';
import {
    activateAccount,
    loginUser,
    registerUser,
} from '../controllers/auth.controller';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import {
    authRouteLimiter,
    loginRouteLimiter,
} from '../middlewares/rateLimit.middleware';
import {
    activateAccountQuerySchema,
    loginBodySchema,
    registerBodySchema,
} from '../validation/schemas';

const router = Router();

router.post(
    '/login',
    loginRouteLimiter,
    validateBody(loginBodySchema),
    loginUser
);
router.post(
    '/register',
    authRouteLimiter,
    validateBody(registerBodySchema),
    registerUser
);
router.get(
    '/activate-account',
    authRouteLimiter,
    validateQuery(activateAccountQuerySchema),
    activateAccount
);

export default router;
