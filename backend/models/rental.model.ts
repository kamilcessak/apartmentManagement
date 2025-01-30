import { Schema, model, Document } from 'mongoose';

export interface RentalSchemaType extends Document {
    apartmentID: number;
    tenantID: number;
    startDate: Date;
    endDate: Date;
    rentalPaymentDay: number;
    monthlyCost: number;
    securityDeposit: number;
    description: string;
    documents: string[];
    isActive: boolean;
}

const rentalSchema = new Schema<RentalSchemaType>({
    apartmentID: { type: Number, required: true },
    tenantID: { type: Number, required: true },
    monthlyCost: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    rentalPaymentDay: { type: Number, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    documents: [{ type: Schema.Types.ObjectId, ref: 'File', default: [] }],
});

export const RentalModel = model<RentalSchemaType>('Rentals', rentalSchema);
