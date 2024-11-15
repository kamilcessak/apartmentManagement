import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

type DecodedToken = any;

export const verifyToken = (
    req: Request & { user?: DecodedToken },
    res: Response,
    next: NextFunction
) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(
        token,
        'secret',
        (err: VerifyErrors | null, decoded?: string | JwtPayload) => {
            if (err) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            req.user = decoded;
            next();
        }
    );
};
