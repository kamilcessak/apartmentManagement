import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { TenantModel } from '../models/tenant.model';

export const createTenant = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const generateInvitationCode = (): string => {
            return crypto
                .randomBytes(5)
                .toString('hex')
                .slice(0, 10)
                .toUpperCase();
        };

        const { firstName, lastName, email, phoneNumber, address } = req.body;
        const data = {
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
            isActive: true,
            invitationCode: generateInvitationCode(),
            owner: userID,
            assignedApartmentID: null,
        };

        const newTenant = await TenantModel.create(data);

        res.status(201).json(newTenant);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while adding a new Tenant',
        });
    }
};

export const getTenants = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const tenants = await TenantModel.find({ owner: userID });
        res.status(200).json(tenants);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while getting your Tenants',
        });
    }
};

export const getTenant = async (req: Request, res: Response) => {
    try {
        const tenantID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const tenant = await TenantModel.findOne({
            _id: tenantID,
            owner: userID,
        });

        if (!tenant) {
            res.status(404).json({ error: 'Tenant not found' });
            return;
        }

        res.status(200).json(tenant);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while getting your Tenant',
        });
    }
};

export const deleteTenant = async (req: Request, res: Response) => {
    try {
        const tenantID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(tenantID)) {
            res.status(400).json({ error: 'Invalid Tenant ID format' });
            return;
        }

        const deletedTenant = await TenantModel.findOneAndDelete({
            _id: tenantID,
            owner: userID,
        });

        if (!deletedTenant) {
            res.status(404).json({
                error: 'Tenant not found or you are not the owner',
            });
            return;
        }

        res.status(200).json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while removing your Tenant',
        });
    }
};

export const patchTenant = async (req: Request, res: Response) => {
    try {
        const tenantID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(tenantID)) {
            res.status(400).json({ error: 'Invalid Tenant ID format' });
            return;
        }

        const updatedTenant = await TenantModel.findOneAndUpdate(
            { _id: tenantID, owner: userID },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedTenant) {
            res.status(404).json({
                error: 'Tenant not found or you are not the owner',
            });
            return;
        }

        res.status(200).json({ message: 'Tenant updated successfully' });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while updating your Tenant',
        });
    }
};
