import { Request, Response } from 'express';

import { UserModel } from '../models/user.model';
import { ApartmentModel } from '../models/apartment.model';

export const getUser = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const [user, apartments] = await Promise.all([
            UserModel.findById(userID).select('-password -__v').lean(),
            ApartmentModel.find({ owner: userID })
                .select('address isAvailable roomCount monthlyCost')
                .lean(),
        ]);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json({ ...user, apartments: apartments || [] });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while getting User data',
        });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        const updateData = req.body;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const {
            password,
            role,
            isEmailVerified,
            email,
            invitationCode,
            ...allowedUpdates
        } = updateData;
        const updates = Object.keys(allowedUpdates);
        const allowedFields = ['firstName', 'lastName', 'phoneNumber'];
        const isValidOperation = updates.every((update) =>
            allowedFields.includes(update)
        );

        if (!isValidOperation) {
            res.status(400).json({
                error: 'You want to update not allowed data',
            });
            return;
        }

        if (updates.length > 0) {
            const user = await UserModel.findByIdAndUpdate(
                userID,
                { $set: allowedUpdates },
                { new: true, runValidators: true }
            ).select('-password -__v');

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
        }

        const updatedUser = await UserModel.findById(userID)
            .select('-password -__v')
            .lean();

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while updating user data',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
