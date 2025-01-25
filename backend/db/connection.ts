import mongoose from 'mongoose';
import { ATLAS_URI } from '../config';

export const initializeDatabase = async () => {
    try {
        await mongoose.connect(ATLAS_URI!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            dbName: 'apartmentManagement',
        });
        console.log('Successfully connected to MongoDB!');
    } catch (error) {
        console.error(
            'An error occurred while initializing the database',
            error
        );
        throw error;
    }
};
