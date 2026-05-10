import { z } from 'zod';

const objectIdString = z.string().refine(
    (v) => /^[a-fA-F0-9]{24}$/.test(v),
    'Invalid id format'
);

export const loginBodySchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1, 'Password is required'),
});

export const registerBodySchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phoneNumber: z.string().trim().min(1, 'Phone number is required'),
    invitationCode: z.string().trim().optional(),
});

export const activateAccountQuerySchema = z.object({
    token: z.string().min(1, 'Activation token is required'),
});

const urlPathString = z
    .string()
    .max(2048)
    .refine((s) => !s.includes('..'), 'Invalid path');

export const apartmentCreateBodySchema = z.object({
    street: z.string().trim().min(1),
    buildingNumber: z.string().trim().min(1),
    apartmentNumber: z.string().trim().optional(),
    postalCode: z.string().trim().min(1),
    city: z.string().trim().min(1),
    metric: z.coerce.number().positive(),
    roomCount: z.coerce.number().int().min(0),
    monthlyCost: z.coerce.number().min(0),
    description: z.string(),
    equipment: z.string().optional(),
    photos: z.array(urlPathString).optional(),
    documents: z.array(urlPathString).optional(),
});

export const apartmentPatchBodySchema = z
    .object({
        street: z.string().trim().min(1).optional(),
        buildingNumber: z.string().trim().min(1).optional(),
        apartmentNumber: z.string().trim().optional(),
        postalCode: z.string().trim().min(1).optional(),
        city: z.string().trim().min(1).optional(),
        metric: z.coerce.number().positive().optional(),
        roomCount: z.coerce.number().int().min(0).optional(),
        monthlyCost: z.coerce.number().min(0).optional(),
        description: z.string().optional(),
        equipment: z.string().optional(),
        photos: z.array(urlPathString).optional(),
        documents: z.array(urlPathString).optional(),
        isAvailable: z.coerce.boolean().optional(),
    })
    .strict();

export const tenantCreateBodySchema = z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    email: z.string().trim().email(),
    phoneNumber: z.string().trim().min(1),
    address: z.string().trim().min(1),
});

export const tenantPatchBodySchema = z
    .object({
        firstName: z.string().trim().min(1).optional(),
        lastName: z.string().trim().min(1).optional(),
        email: z.string().trim().email().optional(),
        phoneNumber: z.string().trim().min(1).optional(),
        address: z.string().trim().min(1).optional(),
        isActive: z.coerce.boolean().optional(),
    })
    .strict();

export const rentalCreateBodySchema = z.object({
    apartmentID: objectIdString,
    tenantID: objectIdString,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    rentalPaymentDay: z.coerce.number().int().min(1).max(31),
    monthlyCost: z.coerce.number().min(0),
    securityDeposit: z.coerce.number().min(0).optional(),
    description: z.string().optional(),
    documents: z.array(urlPathString).optional(),
    photos: z.array(urlPathString).optional(),
});

export const rentalPatchBodySchema = z
    .object({
        apartmentID: objectIdString.optional(),
        tenantID: objectIdString.optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        rentalPaymentDay: z.coerce.number().int().min(1).max(31).optional(),
        monthlyCost: z.coerce.number().min(0).optional(),
        securityDeposit: z.coerce.number().min(0).optional(),
        description: z.string().optional(),
        documents: z.array(urlPathString).optional(),
        photos: z.array(urlPathString).optional(),
    })
    .strict();

export const invoiceCreateBodySchema = z.object({
    apartmentID: objectIdString,
    invoiceType: z.string().trim().min(1),
    amount: z.coerce.number().min(0),
    dueDate: z.coerce.date(),
    invoiceID: z.string().trim().min(1),
    document: urlPathString.nullable().optional(),
});

export const invoicePatchBodySchema = z
    .object({
        apartmentID: objectIdString.optional(),
        invoiceType: z.string().trim().min(1).optional(),
        amount: z.coerce.number().min(0).optional(),
        dueDate: z.coerce.date().optional(),
        invoiceID: z.string().trim().min(1).optional(),
        document: urlPathString.nullable().optional(),
        isPaid: z.coerce.boolean().optional(),
        paidDate: z.union([z.null(), z.coerce.date()]).optional(),
    })
    .strict();

export const userPatchBodySchema = z
    .object({
        firstName: z.string().trim().min(1).optional(),
        lastName: z.string().trim().min(1).optional(),
        phoneNumber: z.string().trim().min(1).optional(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, {
        message: 'At least one field is required',
    });

export const invoicesListQuerySchema = z
    .object({
        apartmentID: objectIdString.optional(),
        isPaid: z.enum(['true', 'false']).optional(),
        dueDateFrom: z.string().optional(),
        dueDateTo: z.string().optional(),
        invoiceType: z.string().optional(),
    })
    .strict();
