import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { RentalModel } from '../models/rental.model';
import { ApartmentModel } from '../models/apartment.model';
import { UserModel } from '../models/user.model';

export const createRental = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const {
            apartmentID,
            tenantID,
            startDate,
            endDate,
            rentalPaymentDay,
            monthlyCost,
            securityDeposit,
            description,
            documents,
        } = req.body;
        const data = {
            apartmentID,
            tenantID,
            startDate,
            endDate,
            rentalPaymentDay,
            securityDeposit,
            monthlyCost,
            description,
            documents,
            owner: userID,
        };

        const apartment = await ApartmentModel.findOne({
            _id: apartmentID,
            owner: userID,
        });
        if (!apartment) {
            res.status(404).json({
                error: 'Apartment not found or not owned by you',
            });
            return;
        }

        const tenant = await UserModel.findOne({
            _id: tenantID,
            owner: userID,
        });
        if (!tenant) {
            res.status(404).json({
                error: 'Tenant not found or not owned by you',
            });
            return;
        }

        const newRental = await RentalModel.create(data);

        res.status(201).json(newRental);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while creating a new apartment',
        });
    }
};

export const getRentals = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const rentals = await RentalModel.find({ owner: userID });
        res.status(200).json(rentals);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while getting your rentals',
        });
    }
};

export const getRental = async (req: Request, res: Response) => {
    try {
        const rentalID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const rental = await RentalModel.findOne({
            _id: rentalID,
            owner: userID,
        });

        if (!rental) {
            res.status(404).json({ error: 'Rental not found' });
            return;
        }

        res.status(200).json(rental);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while getting your rental',
        });
    }
};

export const deleteRental = async (req: Request, res: Response) => {
    try {
        const rentalID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(rentalID)) {
            res.status(400).json({ error: 'Invalid rental ID format' });
            return;
        }

        const deletedRental = await RentalModel.findOneAndDelete({
            _id: rentalID,
            owner: userID,
        });

        if (!deletedRental) {
            res.status(404).json({
                error: 'Rental not found or you are not the owner',
            });
            return;
        }

        res.status(200).json({ message: 'Rental deleted successfully' });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while removing your rental',
        });
    }
};

export const patchRental = async (req: Request, res: Response) => {
    try {
        const rentalID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(rentalID)) {
            res.status(400).json({ error: 'Invalid rental ID format' });
            return;
        }

        const { apartmentID, tenantID, ...updateFields } = req.body;

        if (apartmentID) {
            if (!mongoose.Types.ObjectId.isValid(apartmentID)) {
                res.status(400).json({ error: 'Invalid apartment ID format' });
                return;
            }

            const apartment = await ApartmentModel.findOne({
                _id: apartmentID,
                owner: userID,
            });
            if (!apartment) {
                res.status(404).json({
                    error: 'Apartment not found or not owned by you',
                });
                return;
            }
        }

        if (tenantID) {
            if (!mongoose.Types.ObjectId.isValid(tenantID)) {
                res.status(400).json({ error: 'Invalid tenant ID format' });
                return;
            }

            const tenant = await UserModel.findById(tenantID);
            if (!tenant) {
                res.status(404).json({ error: 'Tenant not found' });
                return;
            }
        }

        const updatedRental = await RentalModel.findOneAndUpdate(
            { _id: rentalID, owner: userID },
            { $set: { ...updateFields, apartmentID, tenantID } },
            { new: true, runValidators: true }
        );

        if (!updatedRental) {
            res.status(404).json({
                error: 'Rental not found or you are not the owner',
            });
            return;
        }

        res.status(200).json({
            message: 'Rental updated successfully',
            rental: updatedRental,
        });
    } catch (error) {
        console.error('Error updating rental:', error);
        res.status(500).json({
            error: 'An error occurred while updating your rental',
        });
    }
};
