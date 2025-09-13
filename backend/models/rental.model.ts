import { Schema, model, Document } from 'mongoose';

export interface RentalSchemaType extends Document {
    apartmentID: string;
    tenantID: string;
    startDate: Date;
    endDate: Date;
    rentalPaymentDay: number;
    monthlyCost: number;
    securityDeposit: number;
    description: string;
    documents: string[];
    photos: string[];
    isActive: boolean;
    owner: string;
}

const rentalSchema = new Schema<RentalSchemaType>({
    apartmentID: { type: String, required: true },
    tenantID: { type: String, required: true },
    owner: { type: String, required: true },
    monthlyCost: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    rentalPaymentDay: { type: Number, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    documents: [{ type: String }],
    photos: [{ type: String }],
});

export const RentalModel = model<RentalSchemaType>('Rentals', rentalSchema);
