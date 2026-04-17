import { FC } from "react";
import { Chip, Divider, Typography } from "@mui/material";
import { MdPaid, MdReceiptLong } from "react-icons/md";
import dayjs from "dayjs";

import { EmptyView } from "@components/common";
import { getApartmentIdFromAddress } from "@utils/apartment";
import { capitalizeFirstLetter } from "@utils/common";

import { UpcomingPayment } from "../types";

type Props = {
  payments: UpcomingPayment[];
  apartmentsById: Record<string, { _id: string; address: string }>;
};

const getDueLabel = (dueDate: string) => {
  const diff = dayjs(dueDate).startOf("day").diff(dayjs().startOf("day"), "day");
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return "due today";
  if (diff === 1) return "due tomorrow";
  return `in ${diff} days`;
};

export const UpcomingPaymentsWidget: FC<Props> = ({
  payments,
  apartmentsById,
}) => {
  return (
    <section className="flex flex-col gap-4 border-2 border-gray-200 rounded-md p-4">
      <div className="flex flex-row items-center justify-between">
        <Typography variant="h6" className="font-semibold">
          Upcoming payments
        </Typography>
        <Chip
          size="small"
          label={`${payments.length} in next 30 days`}
          color={payments.length > 0 ? "primary" : "default"}
        />
      </div>
      <Divider />
      {payments.length ? (
        <ul className="flex flex-col gap-2">
          {payments.map((payment) => {
            const apartment = apartmentsById[payment.apartmentID];
            const apartmentLabel = apartment?.address
              ? getApartmentIdFromAddress(apartment.address)
              : "Unknown apartment";

            const dueDiff = dayjs(payment.dueDate)
              .startOf("day")
              .diff(dayjs().startOf("day"), "day");
            const dueLabelColor =
              dueDiff < 0
                ? "text-red-700"
                : dueDiff <= 3
                ? "text-amber-700"
                : "text-gray-600";

            return (
              <li
                key={`${payment.kind}-${payment._id}`}
                className="flex flex-row items-center justify-between gap-4 p-3 border border-gray-200 rounded"
              >
                <div className="flex flex-row items-center gap-3">
                  <div className="text-gray-600">
                    {payment.kind === "invoice" ? (
                      <MdReceiptLong size={24} />
                    ) : (
                      <MdPaid size={24} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <Typography variant="subtitle2" className="font-semibold">
                      {payment.kind === "invoice"
                        ? `${capitalizeFirstLetter(
                            payment.invoiceType
                          )} · ${payment.invoiceID}`
                        : `Rent · day ${payment.rentalPaymentDay} of month`}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      {apartmentLabel}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Typography variant="subtitle1" className="font-semibold">
                    {payment.amount.toFixed(2)} PLN
                  </Typography>
                  <Typography variant="caption" className={dueLabelColor}>
                    {dayjs(payment.dueDate).format("DD.MM.YYYY")} ·{" "}
                    {getDueLabel(payment.dueDate)}
                  </Typography>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyView message="No upcoming payments in the next 30 days" />
      )}
    </section>
  );
};
