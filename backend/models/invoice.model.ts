import { Schema, model, Document } from 'mongoose';

export interface InvoiceSchemaType extends Document {
    apartmentID: number;
    invoiceType: string;
    amount: number;
    dueDate: Date;
    uploadDate: Date;
    paidDate: Date | null;
    invoiceID: string;
    document: string | null;
    isPaid: boolean;
}

const invoiceSchema = new Schema<InvoiceSchemaType>({
    apartmentID: { type: Number, required: true },
    invoiceType: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    uploadDate: { type: Date, default: new Date() },
    paidDate: { type: Date, default: null },
    invoiceID: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    document: [{ type: Schema.Types.ObjectId, ref: 'File', default: null }],
});

export const InvoiceModel = model<InvoiceSchemaType>('Invoices', invoiceSchema);
