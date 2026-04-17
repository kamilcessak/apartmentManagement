import { useMemo, useState } from "react";
import { Button } from "@mui/material";
import { MdAdd } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { EmptyView, LoadingView, RouteContent, ErrorView } from "@components/common";
import api from "@services/api";
import { ApartmentListType } from "@features/apartments/types/apartment.type";

import { InvoiceFilters, InvoiceType } from "../types";
import { InvoiceItem, InvoicesFilters } from "../components";

export const InvoicesScreen = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<InvoiceFilters>({
    isPaid: "all",
  });

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.apartmentID) params.append("apartmentID", filters.apartmentID);
    if (filters.isPaid && filters.isPaid !== "all") {
      params.append("isPaid", filters.isPaid === "paid" ? "true" : "false");
    }
    if (filters.dueDateFrom) params.append("dueDateFrom", filters.dueDateFrom);
    if (filters.dueDateTo) params.append("dueDateTo", filters.dueDateTo);
    const value = params.toString();
    return value ? `?${value}` : "";
  }, [filters]);

  const handleGetInvoices = async () => {
    const result = await api.get<InvoiceType[]>(`/invoices${queryParams}`);
    return result.data;
  };

  const handleGetApartments = async () => {
    const result = await api.get<ApartmentListType[]>("/apartmentsList");
    return result.data;
  };

  const {
    data: invoices,
    isLoading: isInvoicesLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["invoices", "list", queryParams],
    queryFn: handleGetInvoices,
  });

  const { data: apartmentsList } = useQuery({
    queryKey: ["apartments", "ids", "LIST"],
    queryFn: handleGetApartments,
  });

  if (isInvoicesLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error?.message} onClick={refetch} />;

  return (
    <RouteContent>
      <header className="flex flex-row justify-between items-center p-8 bg-white border-b-2 border-gray-200">
        <h1 className="text-3xl font-semibold">List of your invoices</h1>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<MdAdd />}
          style={{ textTransform: "none" }}
          onClick={() => navigate("/invoices/new")}
        >
          Add new invoice
        </Button>
      </header>
      <main className="flex h-full flex-col gap-4 bg-white p-8 overflow-y-scroll scrollbar-hide">
        <InvoicesFilters
          value={filters}
          onChange={setFilters}
          apartments={apartmentsList ?? []}
        />
        {invoices?.length ? (
          invoices.map((invoice) => (
            <InvoiceItem
              key={`invoice-item-${invoice._id}`}
              invoice={invoice}
            />
          ))
        ) : (
          <EmptyView message="No invoices found" />
        )}
      </main>
    </RouteContent>
  );
};
