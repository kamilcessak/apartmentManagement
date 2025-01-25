import { Request, Response } from 'express';
import mongoose from 'mongoose';
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

export const getApartment = async (req: Request, res: Response) => {
    try {
        const apartmentID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const apartment = await ApartmentModel.findOne({
            _id: apartmentID,
            owner: userID,
        });

        if (!apartment) {
            res.status(404).json({ error: 'Apartment not found' });
            return;
        }

        res.status(200).json(apartment);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while getting your apartment',
        });
    }
};

export const deleteApartment = async (req: Request, res: Response) => {
    try {
        const apartmentID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(apartmentID)) {
            res.status(400).json({ error: 'Invalid apartment ID format' });
            return;
        }

        const deletedApartment = await ApartmentModel.findOneAndDelete({
            _id: apartmentID,
            owner: userID,
        });

        if (!deletedApartment) {
            res.status(404).json({
                error: 'Apartment not found or you are not the owner',
            });
            return;
        }

        res.status(200).json({ message: 'Apartment deleted successfully' });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while removing your apartment',
        });
    }
};

export const patchApartment = async (req: Request, res: Response) => {
    try {
        const apartmentID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(apartmentID)) {
            res.status(400).json({ error: 'Invalid apartment ID format' });
            return;
        }

        const updatedApartment = await ApartmentModel.findOneAndUpdate(
            { _id: apartmentID, owner: userID },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedApartment) {
            res.status(404).json({
                error: 'Apartment not found or you are not the owner',
            });
            return;
        }

        res.status(200).json({ message: 'Apartment updated successfully' });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while updating your apartment',
        });
    }
};
