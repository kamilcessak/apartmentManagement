import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { InvoiceModel } from '../models/invoice.model';
import { ApartmentModel } from '../models/apartment.model';

export const createInvoice = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const {
            apartmentID,
            invoiceType,
            amount,
            dueDate,
            invoiceID,
            document,
        } = req.body;

        if (!apartmentID || !mongoose.Types.ObjectId.isValid(apartmentID)) {
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

        const data = {
            apartmentID,
            invoiceType,
            amount,
            dueDate,
            invoiceID,
            document: document ?? null,
            owner: userID,
        };

        const newInvoice = await InvoiceModel.create(data);

        res.status(201).json(newInvoice);
    } catch (error) {
        console.error('[createInvoice]', error);
        res.status(500).json({
            error: 'An error occurred while creating a new invoice',
        });
    }
};

export const getInvoices = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const { apartmentID, isPaid, dueDateFrom, dueDateTo } = req.query;

        const filter: Record<string, unknown> = { owner: userID };

        if (apartmentID && typeof apartmentID === 'string') {
            if (!mongoose.Types.ObjectId.isValid(apartmentID)) {
                res.status(400).json({ error: 'Invalid apartment ID format' });
                return;
            }
            filter.apartmentID = apartmentID;
        }

        if (isPaid !== undefined) {
            if (isPaid === 'true') filter.isPaid = true;
            else if (isPaid === 'false') filter.isPaid = false;
        }

        if (dueDateFrom || dueDateTo) {
            const range: Record<string, Date> = {};
            if (typeof dueDateFrom === 'string') {
                const from = new Date(dueDateFrom);
                if (!Number.isNaN(from.getTime())) range.$gte = from;
            }
            if (typeof dueDateTo === 'string') {
                const to = new Date(dueDateTo);
                if (!Number.isNaN(to.getTime())) range.$lte = to;
            }
            if (Object.keys(range).length > 0) {
                filter.dueDate = range;
            }
        }

        const invoices = await InvoiceModel.find(filter).sort({
            dueDate: -1,
        });
        res.status(200).json(invoices);
    } catch (error) {
        console.error('[getInvoices]', error);
        res.status(500).json({
            error: 'An error occurred while getting your invoices',
        });
    }
};

export const getInvoice = async (req: Request, res: Response) => {
    try {
        const invoiceID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(invoiceID)) {
            res.status(400).json({ error: 'Invalid invoice ID format' });
            return;
        }

        const invoice = await InvoiceModel.findOne({
            _id: invoiceID,
            owner: userID,
        });

        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }

        res.status(200).json(invoice);
    } catch (error) {
        console.error('[getInvoice]', error);
        res.status(500).json({
            error: 'An error occurred while getting your invoice',
        });
    }
};

export const deleteInvoice = async (req: Request, res: Response) => {
    try {
        const invoiceID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(invoiceID)) {
            res.status(400).json({ error: 'Invalid invoice ID format' });
            return;
        }

        const deletedInvoice = await InvoiceModel.findOneAndDelete({
            _id: invoiceID,
            owner: userID,
        });

        if (!deletedInvoice) {
            res.status(404).json({
                error: 'Invoice not found or you are not the owner',
            });
            return;
        }

        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('[deleteInvoice]', error);
        res.status(500).json({
            error: 'An error occurred while removing your invoice',
        });
    }
};

export const patchInvoice = async (req: Request, res: Response) => {
    try {
        const invoiceID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(invoiceID)) {
            res.status(400).json({ error: 'Invalid invoice ID format' });
            return;
        }

        const { apartmentID, isPaid, paidDate, ...rest } = req.body;
        const update: Record<string, unknown> = { ...rest };

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
            update.apartmentID = apartmentID;
        }

        if (isPaid !== undefined) {
            update.isPaid = !!isPaid;
            if (isPaid) {
                update.paidDate = paidDate ? new Date(paidDate) : new Date();
            } else {
                update.paidDate = null;
            }
        } else if (paidDate !== undefined) {
            update.paidDate = paidDate ? new Date(paidDate) : null;
        }

        const updatedInvoice = await InvoiceModel.findOneAndUpdate(
            { _id: invoiceID, owner: userID },
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!updatedInvoice) {
            res.status(404).json({
                error: 'Invoice not found or you are not the owner',
            });
            return;
        }

        res.status(200).json(updatedInvoice);
    } catch (error) {
        console.error('[patchInvoice]', error);
        res.status(500).json({
            error: 'An error occurred while updating your invoice',
        });
    }
};

export const getInvoicesByApartment = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        const apartmentID = req.params.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

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

        const invoices = await InvoiceModel.find({
            apartmentID,
            owner: userID,
        }).sort({ dueDate: -1 });

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
        console.error('[getInvoicesByApartment]', error);
        res.status(500).json({
            error: 'An error occurred while getting invoices for the apartment',
        });
    }
};
