import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserSchemaType extends Document {
    email: string;
    password: string;
    phoneNumber: string;
    invitationCode?: string;
    isEmailVerified: boolean;
    role: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserSchemaType>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: { type: String, required: true },
    invitationCode: { type: String },
    isEmailVerified: { type: Boolean, default: false },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = model<UserSchemaType>('User', userSchema);
