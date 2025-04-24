import { Schema, model, Document } from 'mongoose';

export interface TenantSchemaType extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    invitationCode: string;
    isActive: boolean;
    owner: string;
    assignedApartmentID: string | null;
}

const tenantSchema = new Schema<TenantSchemaType>({
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    invitationCode: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    owner: { type: String, required: true },
    assignedApartmentID: { type: String },
});

export const TenantModel = model<TenantSchemaType>('Tenant', tenantSchema);
