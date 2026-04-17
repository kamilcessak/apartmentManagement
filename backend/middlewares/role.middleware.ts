import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user.types';

export const requireRole =
    (...allowedRoles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        const role = req.user?.role;

        if (!role) {
            res.status(403).json({ error: 'User role not available' });
            return;
        }

        if (!allowedRoles.includes(role as UserRole)) {
            res.status(403).json({
                error: `This resource requires role: ${allowedRoles.join(' or ')}`,
            });
            return;
        }

        next();
    };
