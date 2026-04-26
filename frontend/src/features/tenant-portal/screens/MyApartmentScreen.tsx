import { useQuery } from "@tanstack/react-query";
import { Typography, Chip } from "@mui/material";
import { MdApartment, MdCheckCircle, MdCancel } from "react-icons/md";

import {
  EmptyView,
  ErrorView,
  LoadingView,
  RouteContent,
} from "@components/common";
import api from "@services/api";
import { formatApartmentFullAddress } from "@utils/apartment";

import { MyApartmentResponse } from "../types";

const labelClass = "text-gray-500 text-sm";
const valueClass = "text-gray-900 text-base";

export const MyApartmentScreen = () => {
  const { data, isLoading, isError, error, refetch } =
    useQuery<MyApartmentResponse>({
      queryKey: ["me", "apartment"],
      queryFn: async () => {
        const result = await api.get<MyApartmentResponse>("/me/apartment");
        return result.data;
      },
      retry: false,
    });

  if (isLoading) return <LoadingView />;
  if (isError) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404) {
      return (
        <RouteContent>
          <header className="p-8 border-b-2 border-gray-200">
            <Typography variant="h4" className="font-semibold">
              My apartment
            </Typography>
          </header>
          <EmptyView message="No apartment is currently assigned to your account" />
        </RouteContent>
      );
    }
    return <ErrorView message={`${error?.message}`} onClick={refetch} />;
  }

  if (!data) return <EmptyView message="No data" />;

  const { apartment, tenant } = data;

  return (
    <RouteContent>
      <header className="flex flex-row items-center justify-between p-8 border-b-2 border-gray-200">
        <div className="flex flex-col">
          <Typography variant="h4" className="font-semibold">
            My apartment
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Details of the apartment assigned to your account
          </Typography>
        </div>
        <Chip
          icon={
            apartment.isAvailable ? (
              <MdCheckCircle size={16} />
            ) : (
              <MdCancel size={16} />
            )
          }
          label={apartment.isAvailable ? "Available" : "Rented"}
          color={apartment.isAvailable ? "success" : "default"}
          size="small"
        />
      </header>
      <main className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-6 p-8">
        <section className="border-2 border-gray-300 rounded-md p-6 flex flex-col gap-3">
          <div className="flex flex-row items-center gap-2">
            <MdApartment size={24} />
            <Typography variant="h6" className="font-semibold">
              {formatApartmentFullAddress(apartment)}
            </Typography>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className={labelClass}>Rooms</p>
              <p className={valueClass}>{apartment.roomCount}</p>
            </div>
            <div>
              <p className={labelClass}>Area (m²)</p>
              <p className={valueClass}>{apartment.metric}</p>
            </div>
            <div>
              <p className={labelClass}>Monthly cost</p>
              <p className={valueClass}>
                {apartment.monthlyCost.toFixed(2)} PLN
              </p>
            </div>
            <div>
              <p className={labelClass}>Equipment</p>
              <p className={valueClass}>{apartment.equipment || "—"}</p>
            </div>
          </div>
          {apartment.description ? (
            <div className="mt-2">
              <p className={labelClass}>Description</p>
              <p className={valueClass}>{apartment.description}</p>
            </div>
          ) : null}
        </section>

        <section className="border-2 border-gray-300 rounded-md p-6 flex flex-col gap-3">
          <Typography variant="h6" className="font-semibold">
            My contact details
          </Typography>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelClass}>Name</p>
              <p className={valueClass}>
                {tenant.firstName} {tenant.lastName}
              </p>
            </div>
            <div>
              <p className={labelClass}>Email</p>
              <p className={valueClass}>{tenant.email}</p>
            </div>
            <div>
              <p className={labelClass}>Phone</p>
              <p className={valueClass}>{tenant.phoneNumber}</p>
            </div>
            <div>
              <p className={labelClass}>Correspondence address</p>
              <p className={valueClass}>{tenant.address}</p>
            </div>
          </div>
        </section>
      </main>
    </RouteContent>
  );
};
