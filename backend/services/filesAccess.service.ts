import mongoose from 'mongoose';
import { ApartmentModel } from '../models/apartment.model';
import { RentalModel } from '../models/rental.model';
import { InvoiceModel } from '../models/invoice.model';
import { TenantModel } from '../models/tenant.model';
import { UploadedFileModel } from '../models/uploadedFile.model';

const uploadsUrl = (filename: string) => `/uploads/${filename}`;

/**
 * Returns whether the user may read a stored upload (by stored filename).
 * Landlord: uploader registry match or file referenced on owned resources.
 * Tenant: file linked to assigned apartment / active rental / invoice for that apartment.
 */
export const userCanAccessUpload = async (
    userId: string,
    role: 'Landlord' | 'Tenant',
    filename: string
): Promise<boolean> => {
    const path = uploadsUrl(filename);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return false;
    }

    const uid = new mongoose.Types.ObjectId(userId);

    if (role === 'Landlord') {
        const registered = await UploadedFileModel.findOne({
            filename,
            owner: uid,
        })
            .select('_id')
            .lean();
        if (registered) return true;

        const onInvoice = await InvoiceModel.findOne({
            owner: uid,
            document: path,
        })
            .select('_id')
            .lean();
        if (onInvoice) return true;

        const onApartment = await ApartmentModel.findOne({
            owner: uid,
            $or: [{ photos: path }, { documents: path }],
        })
            .select('_id')
            .lean();
        if (onApartment) return true;

        const onRental = await RentalModel.findOne({
            owner: uid,
            $or: [{ photos: path }, { documents: path }],
        })
            .select('_id')
            .lean();
        return !!onRental;
    }

    if (role !== 'Tenant') {
        return false;
    }

    const tenant = await TenantModel.findOne({ userID: uid })
        .select('_id assignedApartmentID')
        .lean();
    if (!tenant?.assignedApartmentID) {
        return false;
    }

    const aptId = tenant.assignedApartmentID;

    const invoiceHit = await InvoiceModel.findOne({
        apartmentID: aptId,
        document: path,
    })
        .select('_id')
        .lean();
    if (invoiceHit) return true;

    const apartmentHit = await ApartmentModel.findOne({
        _id: aptId,
        $or: [{ photos: path }, { documents: path }],
    })
        .select('_id')
        .lean();
    if (apartmentHit) return true;

    const rentalHit = await RentalModel.findOne({
        tenantID: tenant._id,
        isActive: true,
        $or: [{ photos: path }, { documents: path }],
    })
        .select('_id')
        .lean();
    return !!rentalHit;
};
