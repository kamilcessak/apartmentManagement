import mongoose, { Schema, model, Document } from 'mongoose';
import { addressRegex } from '../utils/regexs';

export type ApartmentType = {
    address: string;
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

const apartmentSchema = new Schema<ApartmentSchemaType>({
    address: {
        type: String,
        required: true,
        validate: {
            validator: (value: string) => addressRegex.test(value),
            message: 'Address must be in format "ul.Ulica 1/1, 00-000 Miasto"',
        },
    },
    metric: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    roomCount: { type: Number, required: true },
    monthlyCost: { type: Number, required: true },
    description: { type: String, required: true },
    equipment: { type: String },
    photos: [{ type: Schema.Types.ObjectId, ref: 'File', default: [] }],
    documents: [{ type: Schema.Types.ObjectId, ref: 'File', default: [] }],
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const ApartmentModel = model<ApartmentSchemaType>(
    'Apartment',
    apartmentSchema
);
