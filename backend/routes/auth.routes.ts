import { Router } from 'express';
import {
    activateAccount,
    loginUser,
    registerUser,
} from '../controllers/auth.controller';

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/activate-account', activateAccount);

export default router;
