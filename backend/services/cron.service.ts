import cron from 'node-cron';
import mongoose from 'mongoose';
import { RentalModel, RentalSchemaType } from '../models/rental.model';
import { InvoiceModel } from '../models/invoice.model';

const MONTHLY_RENT_BILLING_CRON = '0 2 1 * *';
const MONTHLY_RENT_BILLING_TIMEZONE = 'Europe/Warsaw';

/**
 * Builds the due date for a rental invoice in the current month/year.
 * Clamps `rentalPaymentDay` to the last day of the month when needed
 * (e.g. day 31 in February).
 */
const buildDueDateForCurrentMonth = (rentalPaymentDay: number): Date => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const safeDay = Math.min(
        Math.max(1, Math.floor(rentalPaymentDay) || 1),
        lastDayOfMonth
    );

    return new Date(year, month, safeDay);
};

const buildInvoiceID = (rental: RentalSchemaType, dueDate: Date): string => {
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const rentalSuffix = String(rental._id).slice(-6).toUpperCase();
    return `RENT-${year}${month}-${rentalSuffix}`;
};

/**
 * Iterates over all active rentals and creates a `rent` invoice for each
 * for the current month. A failure on a single rental is logged but does
 * not stop processing of the rest.
 */
export const generateMonthlyRentInvoices = async (): Promise<void> => {
    const startedAt = new Date();
    console.log(
        `[BillingCron] Monthly rent invoice generation started at ${startedAt.toISOString()}`
    );

    try {
        const activeRentals = await RentalModel.find({ isActive: true });

        if (activeRentals.length === 0) {
            console.log('[BillingCron] No active rentals found. Nothing to do.');
            return;
        }

        let createdCount = 0;
        let failedCount = 0;

        for (const rental of activeRentals) {
            try {
                const dueDate = buildDueDateForCurrentMonth(
                    rental.rentalPaymentDay
                );

                await InvoiceModel.create({
                    apartmentID: rental.apartmentID,
                    tenantID: rental.tenantID,
                    rentalID: rental._id as mongoose.Types.ObjectId,
                    owner: rental.owner,
                    invoiceType: 'rent',
                    amount: rental.monthlyCost,
                    dueDate,
                    uploadDate: new Date(),
                    isPaid: false,
                    invoiceID: buildInvoiceID(rental, dueDate),
                });

                createdCount += 1;
            } catch (rentalError) {
                failedCount += 1;
                console.error(
                    `[BillingCron] Failed to create invoice for rental ${String(
                        rental._id
                    )}`,
                    rentalError
                );
            }
        }

        console.log(
            `[BillingCron] Finished. Created: ${createdCount}, Failed: ${failedCount}, Total active rentals: ${activeRentals.length}`
        );
    } catch (error) {
        console.error(
            '[BillingCron] Fatal error during monthly rent invoice generation',
            error
        );
    }
};

/**
 * Schedules the monthly rent invoice generation cron job.
 * Runs at 02:00 on the 1st day of every month (Europe/Warsaw).
 *
 * Must be called AFTER the database connection has been established.
 */
export const initBillingCron = (): void => {
    cron.schedule(
        MONTHLY_RENT_BILLING_CRON,
        () => {
            void generateMonthlyRentInvoices();
        },
        {
            timezone: MONTHLY_RENT_BILLING_TIMEZONE,
        }
    );

    console.log(
        `[BillingCron] Scheduled monthly rent invoice job ("${MONTHLY_RENT_BILLING_CRON}", tz: ${MONTHLY_RENT_BILLING_TIMEZONE}).`
    );
};
