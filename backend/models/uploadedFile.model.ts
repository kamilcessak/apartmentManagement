import mongoose, { Schema, model, Document } from 'mongoose';

export type UploadedFileType = {
    filename: string;
    owner: mongoose.Types.ObjectId;
};

export type UploadedFileSchemaType = Document & UploadedFileType;

const uploadedFileSchema = new Schema<UploadedFileSchemaType>(
    {
        filename: { type: String, required: true, unique: true, trim: true },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export const UploadedFileModel = model<UploadedFileSchemaType>(
    'UploadedFile',
    uploadedFileSchema
);
