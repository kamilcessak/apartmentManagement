import { Request, Response } from 'express';

import { UserModel } from '../models/user.model';

export const getUser = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const user = await UserModel.findById(userID)
            .select('-password -__v')
            .lean();

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while getting User data',
        });
    }
};
