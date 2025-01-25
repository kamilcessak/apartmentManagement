import dotenv from 'dotenv';

dotenv.config();

export const ATLAS_URI = process.env.ATLAS_URI || '';
export const jwtSecret = process.env.JWT_SECRET! || '';
export const port = process.env.PORT || 3000;
