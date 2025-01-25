import { Request } from 'express';
import { UserType } from './user.types';

declare global {
    namespace Express {
        interface Request {
            user?: UserType;
        }
    }
}
