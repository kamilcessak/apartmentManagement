import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { FRONTEND_URL, jwtSecret } from '../config';
import { sendEmail } from '../services/email.service';
import { UserType } from '../types/user.types';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Invalid password or email' });
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid password or email' });
            return;
        }
        const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, {
            expiresIn: '24h',
        });
        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({ token, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during user login' });
    }
};

export const registerUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email, password, phoneNumber } = req.body;
        if (!email || !password || !phoneNumber) {
            res.status(400).json({
                error: 'Email, password and phone number are required',
            });
            return;
        }

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            res.status(400).json({ error: 'Email address already exists' });
            return;
        }

        const userData = {
            email,
            password,
            phoneNumber,
            isEmailVerified: false,
        };

        if (req.body?.invitationCode) {
            Object.assign(userData, {
                invitationCode: req.body?.invitationCode,
                role: 'Tenant',
            });
        } else {
            Object.assign(userData, { role: 'Landlord' });
        }

        const newUser = await UserModel.create(userData);

        const verificationToken = jwt.sign({ id: newUser._id }, jwtSecret, {
            expiresIn: '1h',
        });
        const verificationLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

        try {
            await sendEmail(
                email,
                `Confirm your email`,
                `
                    <div style="display: flex; flex-direction: column;">
                        <h1>Please confirm your email address</h1>
                        <p>Click the link below to verify your email:</p>
                        <a href="${verificationLink}" style="color: blue; text-decoration: underline;">${verificationLink}</a>
                    </div>
                `
            );
        } catch (mailErr) {
            console.error(
                '[registerUser] Failed to send activation email',
                mailErr
            );
        }

        res.status(201).json({
            message: 'User registered successfully',
            userID: newUser._id,
        });
    } catch (err) {
        console.error('[registerUser]', err);
        const message =
            err instanceof Error && err.name === 'ValidationError'
                ? err.message
                : 'An error occurred during user registration';
        res.status(500).json({ error: message });
    }
};

export const activateAccount = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { token } = req.query;

        if (!token) {
            res.status(400).json({ error: 'Activation token is required' });
            return;
        }

        const decoded = jwt.verify(token as string, jwtSecret) as UserType;

        const user = await UserModel.findById(decoded.id);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.isEmailVerified) {
            res.status(400).json({ error: 'Account is already verified' });
            return;
        }

        user.isEmailVerified = true;

        await user.save();

        res.status(200).json({ message: 'Account activated successfully' });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(400).json({
                error: 'Invalid or expired activation token',
            });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
