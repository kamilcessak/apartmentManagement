import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'vitest-jwt-secret';
});

describe('M5 security baseline', () => {
    const app = createApp();

    it('rejects login with invalid body (zod)', async () => {
        const res = await request(app).post('/api/v1/login').send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation failed');
    });

    it('rejects register with short password', async () => {
        const res = await request(app).post('/api/v1/register').send({
            email: 'user@example.com',
            password: 'short',
            phoneNumber: '123456789',
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation failed');
    });

    it('rejects activate-account without token', async () => {
        const res = await request(app).get('/api/v1/activate-account');
        expect(res.status).toBe(400);
    });

    it('requires auth for protected file stream', async () => {
        const res = await request(app).get(
            '/api/v1/files/00000000-0000-0000-0000-000000000000-doc.pdf'
        );
        expect(res.status).toBe(401);
    });
});
