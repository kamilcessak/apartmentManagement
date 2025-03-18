import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import apartmentRoutes from './routes/apartment.routes';
import tenantRoutes from './routes/tenant.routes';
import rentalRoutes from './routes/rental.routes';
import invoiceRoutes from './routes/invoice.routes';
import filesRoutes from './routes/files.routes';
import { initializeDatabase } from './db/connection';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const startServer = async () => {
    try {
        await initializeDatabase();

        app.use('/', authRoutes);
        app.use('/', apartmentRoutes);
        app.use('/', tenantRoutes);
        app.use('/', rentalRoutes);
        app.use('/', invoiceRoutes);
        app.use('/', filesRoutes);
        app.use(
            '/uploads',
            express.static(path.join(process.cwd(), 'uploads'))
        );

        const PORT = process.env.PORT || 5050;
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start the application:', error);
        process.exit(1);
    }
};

startServer();
