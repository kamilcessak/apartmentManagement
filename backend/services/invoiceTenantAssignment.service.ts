import mongoose from 'mongoose';
import { RentalModel } from '../models/rental.model';

export type InvoiceTenantAssignment =
    | {
          ok: true;
          tenantID?: mongoose.Types.ObjectId;
          rentalID?: mongoose.Types.ObjectId;
      }
    | { ok: false; code: 'NO_RENTAL_AGREEMENT' };

/**
 * Requires at least one rental record for the apartment.
 * If the invoice due date falls within a rental period, returns tenant + rental refs.
 */
export async function resolveTenantAssignmentForInvoice(
    apartmentID: string,
    ownerID: string,
    dueDate: Date
): Promise<InvoiceTenantAssignment> {
    const rentals = await RentalModel.find({
        apartmentID,
        owner: ownerID,
    }).lean();

    if (rentals.length === 0) {
        return { ok: false, code: 'NO_RENTAL_AGREEMENT' };
    }

    const due = new Date(dueDate);
    const covering = rentals.find((r) => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        return start <= due && due <= end;
    });

    if (!covering) {
        return { ok: true };
    }

    return {
        ok: true,
        tenantID: covering.tenantID as mongoose.Types.ObjectId,
        rentalID: covering._id as mongoose.Types.ObjectId,
    };
}
