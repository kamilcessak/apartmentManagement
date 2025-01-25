import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { jwtSecret } from '../config';

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
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            res.status(400).json({ error: 'Email address already exists' });
            return;
        }

        const userData = { email, password, phoneNumber };

        if (req.body?.invitationCode) {
            Object.assign(userData, {
                invitationCode: req.body?.invitationCode,
                role: 'Tenant',
            });
        } else {
            Object.assign(userData, { role: 'Landlord' });
        }

        const newUser = await UserModel.create(userData);

        res.status(201).json({
            message: 'User registered successfully',
            userID: newUser._id,
        });
    } catch (err) {
        console.error({ err });
        res.status(500).json({
            error: 'An error occurred during user registration',
        });
    }
};
