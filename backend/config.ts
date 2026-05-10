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

const DEFAULT_DEV_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

/**
 * Origins allowed by CORS. Set `CORS_ORIGINS` to a comma-separated list to
 * override; otherwise `FRONTEND_URL` (if set) is merged with local Vite URLs.
 */
export const getCorsAllowedOrigins = (): string[] => {
    const raw = process.env.CORS_ORIGINS?.split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    if (raw && raw.length > 0) {
        return [...new Set(raw)];
    }
    return [...new Set([...DEFAULT_DEV_ORIGINS, FRONTEND_URL].filter(Boolean))];
};
