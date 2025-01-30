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
        const data = {
            apartmentID,
            invoiceType,
            amount,
            dueDate,
            invoiceID,
            document,
            owner: userID,
        };

        const apartment = await InvoiceModel.findOne({
            _id: apartmentID,
            owner: userID,
        });
        if (!apartment) {
            res.status(404).json({
                error: 'Apartment not found or not owned by you',
            });
            return;
        }

        const newInvoice = await InvoiceModel.create(data);

        res.status(201).json(newInvoice);
    } catch (error) {
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

        const invoices = await InvoiceModel.find({ owner: userID });
        res.status(200).json(invoices);
    } catch (error) {
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

        const { apartmentID, ...updateFields } = req.body;

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

        const updatedInvoice = await InvoiceModel.findOneAndUpdate(
            { _id: invoiceID, owner: userID },
            { $set: { ...updateFields, apartmentID } },
            { new: true, runValidators: true }
        );

        if (!updatedInvoice) {
            res.status(404).json({
                error: 'Invoice not found or you are not the owner',
            });
            return;
        }

        res.status(200).json({ message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while updating your invoice',
        });
    }
};
