import { useQuery } from "@tanstack/react-query";
import { Typography } from "@mui/material";
import { Home, Mail, Phone, UserRound } from "lucide-react";

import {
  ErrorView,
  LoadingView,
  RouteContent,
} from "@components/common";
import api from "@services/api";
import { formatApartmentFullAddress } from "@utils/apartment";

import { MyApartmentResponse } from "../types";

const labelClass = "text-gray-500 text-sm";
const valueClass = "text-gray-900 text-base";
const cardClass = "rounded-xl bg-white p-6 shadow-md shadow-gray-900/10";

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <p className={labelClass}>{label}</p>
    <p className={`${valueClass} font-medium`}>{value}</p>
  </div>
);

const renderHeader = () => (
  <header className="bg-white p-8 shadow-sm shadow-gray-900/10">
    <Typography variant="h4" className="font-semibold">
      Moje mieszkanie
    </Typography>
    <Typography variant="body2" className="text-gray-600 mt-1">
      Szczegóły lokalu i warunki Twojego najmu
    </Typography>
  </header>
);

const renderEmptyState = () => (
  <main className="flex flex-1 items-center justify-center p-8">
    <div className="flex flex-col items-center text-center">
      <Home className="text-gray-300" size={64} strokeWidth={1.6} />
      <p className="mt-4 text-lg font-medium text-gray-900">
        Brak przypisanego mieszkania
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Twój wynajmujący nie przypisał Cię jeszcze do żadnego lokalu.
      </p>
    </div>
  </main>
);

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
          {renderHeader()}
          {renderEmptyState()}
        </RouteContent>
      );
    }
    return <ErrorView message={`${error?.message}`} onClick={refetch} />;
  }

  if (!data) {
    return (
      <RouteContent>
        {renderHeader()}
        {renderEmptyState()}
      </RouteContent>
    );
  }

  const { apartment } = data;
  const photos = apartment.photos.length
    ? apartment.photos
    : Array.from({ length: 6 }, () => "");

  return (
    <RouteContent>
      {renderHeader()}
      <main className="flex h-full w-full flex-1 flex-col overflow-y-scroll bg-slate-50/80 p-8 scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className={cardClass}>
            <Typography variant="h6" className="font-semibold">
              Informacje o lokalu
            </Typography>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <InfoField
                label="Adres"
                value={formatApartmentFullAddress(apartment)}
              />
              <InfoField label="Metraż" value={`${apartment.metric} m2`} />
              <InfoField label="Liczba pokoi" value={`${apartment.roomCount}`} />
            </div>
          </section>

          <section className={cardClass}>
            <Typography variant="h6" className="font-semibold">
              Twoja umowa
            </Typography>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <InfoField label="Miesięczny czynsz" value="2500 PLN" />
              <InfoField label="Kaucja" value="3000 PLN" />
              <InfoField label="Ważność umowy" value="01.01.2025 - 31.12.2026" />
            </div>
          </section>

          <section className={cardClass}>
            <Typography variant="h6" className="font-semibold">
              Kontakt do wynajmującego
            </Typography>
            <div className="mt-5 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 shadow-sm shadow-gray-900/10">
                <UserRound className="text-gray-500" size={22} />
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <p className={labelClass}>Imię i nazwisko</p>
                  <p className={`${valueClass} font-medium`}>Jan Kowalski</p>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone size={16} />
                  <span className="text-sm">+48 123 456 789</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={16} />
                  <span className="text-sm">jan.kowalski@example.com</span>
                </div>
              </div>
            </div>
          </section>

          <section className={`${cardClass} md:col-span-2`}>
            <Typography variant="h6" className="font-semibold">
              Zdjęcia lokalu
            </Typography>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {photos.map((photo, index) => (
                <div
                  key={photo || `placeholder-${index}`}
                  className="aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-sm shadow-gray-900/10"
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={`Zdjęcie lokalu ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-300">
                      <Home size={28} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </RouteContent>
  );
};
