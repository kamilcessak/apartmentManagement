import { Request, Response } from 'express';
import { ApartmentModel } from '../models/apartment.model';

export const createApartment = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const { address, metric, amount, roomCount, monthlyCost, description } =
            req.body;
        const data = {
            address,
            metric,
            amount,
            roomCount,
            monthlyCost,
            description,
            owner: userID,
        };

        if (req.body.photos) {
            Object.assign(data, { photos: req.body.photos });
        }
        if (req.body.documents) {
            Object.assign(data, { documents: req.body.documents });
        }
        if (req.body.equipment) {
            Object.assign(data, { equipment: req.body.equipment });
        }

        const newApartment = await ApartmentModel.create(data);

        res.status(201).json(newApartment);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while creating a new apartment',
        });
    }
};

export const getApartments = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const apartments = await ApartmentModel.find({ owner: userID });
        res.status(200).json(apartments);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while getting your apartments',
        });
    }
};
