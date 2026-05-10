import { createApp, API_PREFIX } from './app';
import { initializeDatabase } from './db/connection';
import { initBillingCron } from './services/cron.service';

export const app = createApp();

const startServer = async () => {
    try {
        await initializeDatabase();

        initBillingCron();

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
