import dotenv from 'dotenv';

dotenv.config();

export const ATLAS_URI = process.env.ATLAS_URI || '';
export const jwtSecret = process.env.JWT_SECRET! || '';
export const port = process.env.PORT || 3000;
export const EMAIL_HOST = process.env.EMAIL_HOST || '';
export const EMAIL_PORT = process.env.EMAIL_PORT || '';
export const EMAIL_SECURE = process.env.EMAIL_SECURE || '';
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';
export const FRONTEND_URL = process.env.FRONTEND_URL || '';
