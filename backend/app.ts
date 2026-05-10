import express, {
    Request,
    Response,
    NextFunction,
    ErrorRequestHandler,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';

import authRoutes from './routes/auth.routes';
import apartmentRoutes from './routes/apartment.routes';
import tenantRoutes from './routes/tenant.routes';
import rentalRoutes from './routes/rental.routes';
import invoiceRoutes from './routes/invoice.routes';
import filesRoutes from './routes/files.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { getCorsAllowedOrigins } from './config';

export const API_PREFIX = '/api/v1';

export const createApp = () => {
    const app = express();

    app.use(
        helmet({
            contentSecurityPolicy: false,
            crossOriginResourcePolicy: { policy: 'cross-origin' },
        })
    );

    const allowedOrigins = getCorsAllowedOrigins();
    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin) {
                    callback(null, true);
                    return;
                }
                callback(null, allowedOrigins.includes(origin));
            },
        })
    );

    app.use(express.json({ limit: '2mb' }));

    app.use(API_PREFIX, authRoutes);
    app.use(API_PREFIX, apartmentRoutes);
    app.use(API_PREFIX, tenantRoutes);
    app.use(API_PREFIX, rentalRoutes);
    app.use(API_PREFIX, invoiceRoutes);
    app.use(API_PREFIX, filesRoutes);
    app.use(API_PREFIX, userRoutes);
    app.use(API_PREFIX, dashboardRoutes);

    app.use((req: Request, res: Response) => {
        res.status(404).json({ error: 'Route not found' });
    });

    const errorHandler: ErrorRequestHandler = (
        err: Error & { status?: number; statusCode?: number },
        _req: Request,
        res: Response,
        _next: NextFunction
    ) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.status(400).json({
                    error: 'File too large (max 10MB per file)',
                });
                return;
            }
            res.status(400).json({ error: err.message });
            return;
        }

        const status = err.status || err.statusCode || 500;
        console.error('[ErrorHandler]', {
            message: err.message,
            status,
            stack: err.stack,
        });
        if (res.headersSent) {
            return;
        }
        res.status(status).json({
            error: err.message || 'Internal Server Error',
        });
    };
    app.use(errorHandler);

    return app;
};
