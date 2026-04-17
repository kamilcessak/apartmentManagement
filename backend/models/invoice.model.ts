import mongoose, { Schema, model, Document } from 'mongoose';

export interface InvoiceSchemaType extends Document {
    apartmentID: mongoose.Types.ObjectId;
    invoiceType: string;
    amount: number;
    dueDate: Date;
    uploadDate: Date;
    paidDate: Date | null;
    invoiceID: string;
    document: string | null;
    isPaid: boolean;
    owner: mongoose.Types.ObjectId;
}

const invoiceSchema = new Schema<InvoiceSchemaType>(
    {
        apartmentID: {
            type: Schema.Types.ObjectId,
            ref: 'Apartment',
            required: true,
        },
        invoiceType: { type: String, required: true },
        amount: { type: Number, required: true },
        dueDate: { type: Date, required: true },
        uploadDate: { type: Date, default: Date.now },
        paidDate: { type: Date, default: null },
        invoiceID: { type: String, required: true },
        isPaid: { type: Boolean, default: false },
        document: { type: String, default: null },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

export const InvoiceModel = model<InvoiceSchemaType>('Invoices', invoiceSchema);
