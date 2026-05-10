import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

const formatZodError = (err: ZodError) =>
    err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
    }));

export const validateBody =
    (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: formatZodError(parsed.error),
            });
            return;
        }
        req.body = parsed.data;
        next();
    };

const normalizeQuery = (query: Request['query']): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(query)) {
        out[key] = Array.isArray(value) ? value[0] : value;
    }
    return out;
};

export const validateQuery =
    (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const parsed = schema.safeParse(normalizeQuery(req.query));
        if (!parsed.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: formatZodError(parsed.error),
            });
            return;
        }
        req.query = parsed.data as Request['query'];
        next();
    };
