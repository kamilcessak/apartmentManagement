import mongoose, { Schema, model, Document } from 'mongoose';

export interface TenantSchemaType extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    invitationCode: string;
    isActive: boolean;
    owner: mongoose.Types.ObjectId;
    assignedApartmentID: mongoose.Types.ObjectId | null;
    userID: mongoose.Types.ObjectId | null;
}

const tenantSchema = new Schema<TenantSchemaType>(
    {
        email: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        address: { type: String, required: true },
        invitationCode: { type: String, required: true, index: true },
        isActive: { type: Boolean, required: true },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignedApartmentID: {
            type: Schema.Types.ObjectId,
            ref: 'Apartment',
            default: null,
        },
        userID: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

export const TenantModel = model<TenantSchemaType>('Tenant', tenantSchema);
