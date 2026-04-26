import { Request, Response } from 'express';

import { UserModel } from '../models/user.model';
import { ApartmentModel } from '../models/apartment.model';
import { TenantModel } from '../models/tenant.model';
import { InvoiceModel } from '../models/invoice.model';
import { RentalModel } from '../models/rental.model';

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

        if (user.role === 'Landlord') {
            const apartments = await ApartmentModel.find({ owner: userID })
                .select(
                    'street buildingNumber apartmentNumber postalCode city isAvailable roomCount monthlyCost'
                )
                .lean();
            res.status(200).json({
                ...user,
                apartments: apartments || [],
            });
            return;
        }

        if (user.role === 'Tenant') {
            const tenant = await TenantModel.findOne({ userID })
                .select(
                    'firstName lastName email phoneNumber address isActive assignedApartmentID owner'
                )
                .lean();
            res.status(200).json({
                ...user,
                tenant: tenant || null,
            });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('[getUser]', error);
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
        console.error('[updateUser]', error);
        res.status(500).json({
            error: 'An error occurred while updating user data',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

// ---- Tenant-scoped helpers (M4.3) ----------------------------------------

const resolveTenantForUser = async (userID: string) =>
    TenantModel.findOne({ userID }).lean();

export const getMyApartment = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const tenant = await resolveTenantForUser(userID);
        if (!tenant) {
            res.status(404).json({
                error: 'No apartment is currently assigned to your account',
            });
            return;
        }

        let apartmentID = tenant.assignedApartmentID;

        // Backward-compatibility for existing data: if assignment field is
        // missing, recover apartment from the tenant's active rental.
        if (!apartmentID) {
            const activeRental = await RentalModel.findOne({
                tenantID: tenant._id,
                isActive: true,
            })
                .select('apartmentID')
                .lean();

            if (!activeRental?.apartmentID) {
                res.status(404).json({
                    error: 'No apartment is currently assigned to your account',
                });
                return;
            }

            apartmentID = activeRental.apartmentID;

            await TenantModel.updateOne(
                { _id: tenant._id, assignedApartmentID: null },
                { $set: { assignedApartmentID: apartmentID } }
            );
        }

        const apartment = await ApartmentModel.findById(apartmentID).lean();

        if (!apartment) {
            res.status(404).json({ error: 'Apartment not found' });
            return;
        }

        res.status(200).json({
            apartment,
            tenant: {
                _id: tenant._id,
                firstName: tenant.firstName,
                lastName: tenant.lastName,
                email: tenant.email,
                phoneNumber: tenant.phoneNumber,
                address: tenant.address,
            },
        });
    } catch (error) {
        console.error('[getMyApartment]', error);
        res.status(500).json({
            error: 'An error occurred while getting your apartment',
        });
    }
};

export const getMyInvoices = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const tenant = await resolveTenantForUser(userID);
        if (!tenant) {
            res.status(200).json({ invoices: [], summary: null });
            return;
        }

        let apartmentID = tenant.assignedApartmentID;
        if (!apartmentID) {
            const activeRental = await RentalModel.findOne({
                tenantID: tenant._id,
                isActive: true,
            })
                .select('apartmentID')
                .lean();
            apartmentID = activeRental?.apartmentID ?? null;
        }

        if (!apartmentID) {
            res.status(200).json({ invoices: [], summary: null });
            return;
        }

        const invoices = await InvoiceModel.find({
            apartmentID,
        })
            .sort({ dueDate: -1 })
            .lean();

        const now = new Date();
        const summary = invoices.reduce(
            (acc, invoice) => {
                if (invoice.isPaid) {
                    acc.paidAmount += invoice.amount;
                } else {
                    acc.unpaidAmount += invoice.amount;
                    if (invoice.dueDate && new Date(invoice.dueDate) < now) {
                        acc.overdueAmount += invoice.amount;
                        acc.overdueCount += 1;
                    }
                }
                acc.total += invoice.amount;
                return acc;
            },
            {
                total: 0,
                paidAmount: 0,
                unpaidAmount: 0,
                overdueAmount: 0,
                overdueCount: 0,
            }
        );

        res.status(200).json({ invoices, summary });
    } catch (error) {
        console.error('[getMyInvoices]', error);
        res.status(500).json({
            error: 'An error occurred while getting your invoices',
        });
    }
};

export const getMyDocuments = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const tenant = await resolveTenantForUser(userID);
        if (!tenant) {
            res.status(200).json({
                apartmentDocuments: [],
                rentalDocuments: [],
                invoiceDocuments: [],
            });
            return;
        }

        let apartmentID = tenant.assignedApartmentID;
        if (!apartmentID) {
            const activeRental = await RentalModel.findOne({
                tenantID: tenant._id,
                isActive: true,
            })
                .select('apartmentID')
                .lean();
            apartmentID = activeRental?.apartmentID ?? null;
        }

        if (!apartmentID) {
            res.status(200).json({
                apartmentDocuments: [],
                rentalDocuments: [],
                invoiceDocuments: [],
            });
            return;
        }

        const [apartment, rental, invoices] = await Promise.all([
            ApartmentModel.findById(apartmentID)
                .select(
                    'documents photos street buildingNumber apartmentNumber postalCode city'
                )
                .lean(),
            RentalModel.findOne({
                tenantID: tenant._id,
                apartmentID,
                isActive: true,
            })
                .select('documents photos startDate endDate')
                .lean(),
            InvoiceModel.find({
                apartmentID,
                document: { $ne: null },
            })
                .select('invoiceID invoiceType document dueDate amount')
                .lean(),
        ]);

        res.status(200).json({
            apartmentDocuments: apartment?.documents ?? [],
            rentalDocuments: rental?.documents ?? [],
            invoiceDocuments: invoices.map((i) => ({
                _id: i._id,
                invoiceID: i.invoiceID,
                invoiceType: i.invoiceType,
                document: i.document,
                dueDate: i.dueDate,
                amount: i.amount,
            })),
        });
    } catch (error) {
        console.error('[getMyDocuments]', error);
        res.status(500).json({
            error: 'An error occurred while getting your documents',
        });
    }
};
