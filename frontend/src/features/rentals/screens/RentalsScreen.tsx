import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api";

import { RentalType } from "../types/rental.types";
import { RentalItem } from "../components";

export const RentalsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleAddNewRental = () => navigate("/rentals/new");

  const handleGetRentals = async () => {
    try {
      const result = await api.get<RentalType[]>("/rentals");
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { data, isLoading, isRefetching, isError, error, refetch } = useQuery({
    queryKey: ["rentals", "list"],
    queryFn: handleGetRentals,
  });

  const isAnythingLoading = useMemo(
    () => isLoading || isRefetching,
    [isLoading, isRefetching]
  );

  if (isAnythingLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error?.message} onClick={refetch} />;

  const hasAnyRentals = (data?.length ?? 0) > 0;
  const searchQuery = search.trim().toLowerCase();

  return (
    <RouteContent sectionStyle={{ flexDirection: "column" }}>
      <div className="flex h-full flex-col overflow-hidden bg-slate-50 p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {t("rentals.title")}
            </h1>
            <p className="text-sm text-slate-500">{t("rentals.subtitle")}</p>
          </div>
          <Button
            variant="default"
            onClick={handleAddNewRental}
            className="self-start sm:self-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("rentals.addRental")}
          </Button>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("rentals.searchPlaceholder")}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("rentals.columns.address")}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("rentals.columns.tenant")}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("rentals.columns.status")}
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("rentals.columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasAnyRentals ? (
                  data!.map((rental) => (
                    <RentalItem
                      key={`rental-row-${rental._id}`}
                      rental={rental}
                      searchQuery={searchQuery}
                    />
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={4}
                      className="py-12 text-center text-sm text-slate-500"
                    >
                      {t("rentals.empty")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </RouteContent>
  );
};
