import mongoose, { Schema, model, Document } from 'mongoose';

export interface RentalSchemaType extends Document {
    apartmentID: mongoose.Types.ObjectId;
    tenantID: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    rentalPaymentDay: number;
    monthlyCost: number;
    securityDeposit: number;
    description: string;
    documents: string[];
    photos: string[];
    isActive: boolean;
    owner: mongoose.Types.ObjectId;
}

const rentalSchema = new Schema<RentalSchemaType>(
    {
        apartmentID: {
            type: Schema.Types.ObjectId,
            ref: 'Apartment',
            required: true,
        },
        tenantID: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        monthlyCost: { type: Number, required: true },
        securityDeposit: { type: Number, required: true },
        rentalPaymentDay: { type: Number, required: true },
        description: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        documents: [{ type: String }],
        photos: [{ type: String }],
    },
    { timestamps: true }
);

export const RentalModel = model<RentalSchemaType>('Rentals', rentalSchema);
