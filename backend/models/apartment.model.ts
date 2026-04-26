import mongoose, { Schema, model, Document } from 'mongoose';
import { polishPostalCodeRegex } from '../utils/regexs';

export type ApartmentType = {
    street: string;
    buildingNumber: string;
    apartmentNumber?: string;
    postalCode: string;
    city: string;
    metric: number;
    isAvailable?: boolean;
    roomCount: number;
    monthlyCost: number;
    description: string;
    equipment?: string;
    photos?: string[];
    documents?: string[];
    owner: mongoose.Types.ObjectId;
};

export type ApartmentSchemaType = Document & ApartmentType;

const apartmentSchema = new Schema<ApartmentSchemaType>(
    {
        street: { type: String, required: true, trim: true },
        buildingNumber: { type: String, required: true, trim: true },
        apartmentNumber: { type: String, trim: true },
        postalCode: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: (value: string) => polishPostalCodeRegex.test(value),
                message: 'Postal code must be in format XX-XXX (e.g. 00-001)',
            },
        },
        city: { type: String, required: true, trim: true },
        metric: { type: Number, required: true },
        isAvailable: { type: Boolean, default: true },
        roomCount: { type: Number, required: true },
        monthlyCost: { type: Number, required: true },
        description: { type: String, required: true },
        equipment: { type: String },
        photos: [{ type: String }],
        documents: [{ type: String }],
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export const ApartmentModel = model<ApartmentSchemaType>(
    'Apartment',
    apartmentSchema
);
