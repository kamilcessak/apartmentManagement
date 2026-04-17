import express, {
    Request,
    Response,
    NextFunction,
    ErrorRequestHandler,
} from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.routes';
import apartmentRoutes from './routes/apartment.routes';
import tenantRoutes from './routes/tenant.routes';
import rentalRoutes from './routes/rental.routes';
import invoiceRoutes from './routes/invoice.routes';
import filesRoutes from './routes/files.routes';
import userRoutes from './routes/user.routes';
import { initializeDatabase } from './db/connection';

const app = express();
app.use(cors());
app.use(express.json());

const API_PREFIX = '/api/v1';

const startServer = async () => {
    try {
        await initializeDatabase();

        app.use(API_PREFIX, authRoutes);
        app.use(API_PREFIX, apartmentRoutes);
        app.use(API_PREFIX, tenantRoutes);
        app.use(API_PREFIX, rentalRoutes);
        app.use(API_PREFIX, invoiceRoutes);
        app.use(API_PREFIX, filesRoutes);
        app.use(API_PREFIX, userRoutes);

        app.use(
            '/uploads',
            express.static(path.join(process.cwd(), 'uploads'))
        );

        app.use((req: Request, res: Response) => {
            res.status(404).json({ error: 'Route not found' });
        });

        const errorHandler: ErrorRequestHandler = (
            err: Error & { status?: number; statusCode?: number },
            _req: Request,
            res: Response,
            _next: NextFunction
        ) => {
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

        const PORT = process.env.PORT || 5050;
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}${API_PREFIX}`);
        });
    } catch (error) {
        console.error('Failed to start the application:', error);
        process.exit(1);
    }
};

startServer();
