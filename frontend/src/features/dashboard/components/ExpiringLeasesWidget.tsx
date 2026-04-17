import { FC } from "react";
import { Chip, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { EmptyView } from "@components/common";
import { getApartmentIdFromAddress } from "@utils/apartment";

import { ExpiringLease } from "../types";

type Props = {
  leases: ExpiringLease[];
  apartmentsById: Record<string, { _id: string; address: string }>;
};

export const ExpiringLeasesWidget: FC<Props> = ({ leases, apartmentsById }) => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col gap-4 border-2 border-gray-200 rounded-md p-4">
      <div className="flex flex-row items-center justify-between">
        <Typography variant="h6" className="font-semibold">
          Leases ending soon
        </Typography>
        <Chip
          size="small"
          label={`${leases.length} in next 30 days`}
          color={leases.length > 0 ? "warning" : "default"}
        />
      </div>
      <Divider />
      {leases.length ? (
        <ul className="flex flex-col gap-2">
          {leases.map((lease) => {
            const apartment = apartmentsById[lease.apartmentID];
            const apartmentLabel = apartment?.address
              ? getApartmentIdFromAddress(apartment.address)
              : "Unknown apartment";
            const daysLeft = dayjs(lease.endDate)
              .startOf("day")
              .diff(dayjs().startOf("day"), "day");

            return (
              <li
                key={`lease-${lease._id}`}
                className="flex flex-row items-center justify-between gap-4 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/rental/${lease._id}`)}
              >
                <div className="flex flex-col">
                  <Typography variant="subtitle2" className="font-semibold">
                    {apartmentLabel}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    {lease.monthlyCost.toFixed(2)} PLN / month
                  </Typography>
                </div>
                <div className="flex flex-col items-end">
                  <Typography variant="subtitle2" className="font-semibold">
                    {dayjs(lease.endDate).format("DD.MM.YYYY")}
                  </Typography>
                  <Typography
                    variant="caption"
                    className={
                      daysLeft <= 7 ? "text-red-700" : "text-amber-700"
                    }
                  >
                    {daysLeft <= 0
                      ? "ends today"
                      : daysLeft === 1
                      ? "ends tomorrow"
                      : `in ${daysLeft} days`}
                  </Typography>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyView message="No leases ending in the next 30 days" />
      )}
    </section>
  );
};
