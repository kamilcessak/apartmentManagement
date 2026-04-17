import { Request, Response } from 'express';

import { ApartmentModel } from '../models/apartment.model';
import { RentalModel } from '../models/rental.model';
import { InvoiceModel } from '../models/invoice.model';

const UPCOMING_WINDOW_DAYS = 30;

const getNextPaymentDate = (dayOfMonth: number, from: Date): Date => {
    const candidate = new Date(
        from.getFullYear(),
        from.getMonth(),
        dayOfMonth
    );

    if (candidate < from) {
        candidate.setMonth(candidate.getMonth() + 1);
    }

    const daysInMonth = new Date(
        candidate.getFullYear(),
        candidate.getMonth() + 1,
        0
    ).getDate();

    if (candidate.getDate() > daysInMonth) {
        candidate.setDate(daysInMonth);
    }

    return candidate;
};

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const now = new Date();
        const upcomingUntil = new Date(now);
        upcomingUntil.setDate(upcomingUntil.getDate() + UPCOMING_WINDOW_DAYS);

        const [apartments, rentals, invoices] = await Promise.all([
            ApartmentModel.find({ owner: userID }),
            RentalModel.find({ owner: userID }),
            InvoiceModel.find({ owner: userID }),
        ]);

        const apartmentsCount = apartments.length;
        const occupiedCount = apartments.filter((a) => !a.isAvailable).length;
        const occupancyRate =
            apartmentsCount > 0
                ? Math.round((occupiedCount / apartmentsCount) * 100)
                : 0;

        const activeRentals = rentals.filter((r) => r.isActive);
        const mrr = activeRentals.reduce(
            (sum, r) => sum + (r.monthlyCost || 0),
            0
        );

        const unpaidInvoices = invoices.filter((i) => !i.isPaid);
        const overdueInvoices = unpaidInvoices.filter(
            (i) => i.dueDate && new Date(i.dueDate) < now
        );
        const overdueAmount = overdueInvoices.reduce(
            (sum, i) => sum + (i.amount || 0),
            0
        );

        const upcomingInvoices = unpaidInvoices
            .filter((i) => {
                if (!i.dueDate) return false;
                const due = new Date(i.dueDate);
                return due >= now && due <= upcomingUntil;
            })
            .map((i) => ({
                _id: String(i._id),
                kind: 'invoice' as const,
                apartmentID: String(i.apartmentID),
                amount: i.amount,
                dueDate: i.dueDate,
                invoiceID: i.invoiceID,
                invoiceType: i.invoiceType,
            }));

        const upcomingRentalPayments = activeRentals
            .map((r) => {
                const nextPayment = getNextPaymentDate(
                    r.rentalPaymentDay,
                    now
                );
                return {
                    _id: String(r._id),
                    kind: 'rental' as const,
                    apartmentID: String(r.apartmentID),
                    tenantID: String(r.tenantID),
                    amount: r.monthlyCost,
                    dueDate: nextPayment,
                    rentalPaymentDay: r.rentalPaymentDay,
                };
            })
            .filter((p) => p.dueDate <= upcomingUntil);

        const upcomingPayments = [
            ...upcomingInvoices,
            ...upcomingRentalPayments,
        ].sort(
            (a, b) =>
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );

        const expiringLeases = activeRentals
            .filter((r) => {
                if (!r.endDate) return false;
                const end = new Date(r.endDate);
                return end >= now && end <= upcomingUntil;
            })
            .map((r) => ({
                _id: String(r._id),
                apartmentID: String(r.apartmentID),
                tenantID: String(r.tenantID),
                endDate: r.endDate,
                monthlyCost: r.monthlyCost,
            }))
            .sort(
                (a, b) =>
                    new Date(a.endDate).getTime() -
                    new Date(b.endDate).getTime()
            );

        res.status(200).json({
            kpi: {
                apartmentsCount,
                occupiedCount,
                occupancyRate,
                activeRentalsCount: activeRentals.length,
                mrr,
                overdueAmount,
                overdueCount: overdueInvoices.length,
            },
            upcomingPayments,
            expiringLeases,
        });
    } catch (error) {
        console.error('[getDashboard]', error);
        res.status(500).json({
            error: 'An error occurred while loading dashboard data',
        });
    }
};
