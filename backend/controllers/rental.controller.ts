import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { RentalModel } from '../models/rental.model';
import { ApartmentModel } from '../models/apartment.model';
import { TenantModel } from '../models/tenant.model';

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
            photos,
        } = req.body;

        if (!apartmentID || !mongoose.Types.ObjectId.isValid(apartmentID)) {
            res.status(400).json({ error: 'Invalid apartment ID format' });
            return;
        }

        if (!tenantID || !mongoose.Types.ObjectId.isValid(tenantID)) {
            res.status(400).json({ error: 'Invalid tenant ID format' });
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

        const tenant = await TenantModel.findOne({
            _id: tenantID,
            owner: userID,
        });
        if (!tenant) {
            res.status(404).json({
                error: 'Tenant not found or not owned by you',
            });
            return;
        }

        // Guard M3.4 + atomic lock M3.5: flip isAvailable=true -> false in a
        // single atomic operation. If the apartment is already occupied the
        // update returns null and we reject with 409.
        const lockedApartment = await ApartmentModel.findOneAndUpdate(
            {
                _id: apartmentID,
                owner: userID,
                isAvailable: true,
            },
            { $set: { isAvailable: false } },
            { new: true }
        );

        if (!lockedApartment) {
            res.status(409).json({
                error: 'Apartment already has an active rental',
            });
            return;
        }

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
            photos,
            owner: userID,
        };

        try {
            const newRental = await RentalModel.create(data);

            // Keep tenant assignment in sync with active rental so tenant portal
            // can reliably resolve "my apartment" from the tenant record.
            await TenantModel.updateOne(
                { _id: tenantID, owner: userID },
                { $set: { assignedApartmentID: apartmentID } }
            );

            res.status(201).json(newRental);
        } catch (createError) {
            // Roll the apartment back to available so the lock isn't leaked
            await ApartmentModel.updateOne(
                { _id: apartmentID, owner: userID },
                { $set: { isAvailable: true } }
            );
            throw createError;
        }
    } catch (error) {
        console.error('[createRental]', error);
        res.status(500).json({
            error: 'An error occurred while creating a new rental',
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
        console.error('[getRentals]', error);
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
        console.error('[getRental]', error);
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

        // M3.5: if the rental was active, the apartment was locked — release it
        if (deletedRental.isActive) {
            await Promise.all([
                ApartmentModel.updateOne(
                    { _id: deletedRental.apartmentID, owner: userID },
                    { $set: { isAvailable: true } }
                ),
                TenantModel.updateOne(
                    {
                        _id: deletedRental.tenantID,
                        owner: userID,
                        assignedApartmentID: deletedRental.apartmentID,
                    },
                    { $set: { assignedApartmentID: null } }
                ),
            ]);
        }

        res.status(200).json({ message: 'Rental deleted successfully' });
    } catch (error) {
        console.error('[deleteRental]', error);
        res.status(500).json({
            error: 'An error occurred while removing your rental',
        });
    }
};

export const endRental = async (req: Request, res: Response) => {
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

        const rental = await RentalModel.findOne({
            _id: rentalID,
            owner: userID,
        });

        if (!rental) {
            res.status(404).json({
                error: 'Rental not found or you are not the owner',
            });
            return;
        }

        if (!rental.isActive) {
            res.status(400).json({ error: 'Rental is already ended' });
            return;
        }

        rental.isActive = false;
        rental.endDate = new Date();
        await rental.save();

        await Promise.all([
            ApartmentModel.updateOne(
                { _id: rental.apartmentID, owner: userID },
                { $set: { isAvailable: true } }
            ),
            TenantModel.updateOne(
                {
                    _id: rental.tenantID,
                    owner: userID,
                    assignedApartmentID: rental.apartmentID,
                },
                { $set: { assignedApartmentID: null } }
            ),
        ]);

        res.status(200).json({
            message: 'Rental ended successfully',
            rental,
        });
    } catch (error) {
        console.error('[endRental]', error);
        res.status(500).json({
            error: 'An error occurred while ending your rental',
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

        const { apartmentID, tenantID, isActive, ...updateFields } = req.body;

        if (apartmentID !== undefined) {
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

        if (tenantID !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(tenantID)) {
                res.status(400).json({ error: 'Invalid tenant ID format' });
                return;
            }

            // Bug fix (roadmap §7.1): tenants live in TenantModel, not UserModel
            const tenant = await TenantModel.findOne({
                _id: tenantID,
                owner: userID,
            });
            if (!tenant) {
                res.status(404).json({
                    error: 'Tenant not found or not owned by you',
                });
                return;
            }
        }

        const setPayload: Record<string, unknown> = { ...updateFields };
        if (apartmentID !== undefined) setPayload.apartmentID = apartmentID;
        if (tenantID !== undefined) setPayload.tenantID = tenantID;

        // Forbid toggling isActive through PATCH; use /rental/:id/end instead
        // to keep apartment.isAvailable in sync.
        if (isActive !== undefined) {
            res.status(400).json({
                error: 'Use POST /rental/:id/end to end a rental',
            });
            return;
        }

        const updatedRental = await RentalModel.findOneAndUpdate(
            { _id: rentalID, owner: userID },
            { $set: setPayload },
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
        console.error('[patchRental]', error);
        res.status(500).json({
            error: 'An error occurred while updating your rental',
        });
    }
};
