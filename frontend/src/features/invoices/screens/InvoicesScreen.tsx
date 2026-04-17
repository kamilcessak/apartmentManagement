import { useMemo, useState } from "react";
import { Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { EmptyView, LoadingView, RouteContent, ErrorView } from "@components/common";
import api from "@services/api";
import { ApartmentListType } from "@features/apartments/types/apartment.type";
import { getApartmentIdFromAddress } from "@utils/apartment";
import { capitalizeFirstLetter } from "@utils/common";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { InvoiceFilters, InvoiceType } from "../types";
import { InvoicesFilters, InvoiceStatusChip } from "../components";

const formatCurrency = (value: number) => `${value.toFixed(2)} PLN`;

export const InvoicesScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<InvoiceFilters>({
    search: "",
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

  const apartmentLabelById = useMemo(() => {
    const map = new Map<string, string>();
    (apartmentsList ?? []).forEach((apartment) => {
      map.set(apartment._id, getApartmentIdFromAddress(apartment.address));
    });
    return map;
  }, [apartmentsList]);

  const invalidateLists = (apartmentID?: string) => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    if (apartmentID) {
      queryClient.invalidateQueries({
        queryKey: ["apartment", apartmentID, "invoices"],
      });
    }
  };

  const { mutate: deleteInvoice, isPending: isDeleting } = useMutation({
    mutationFn: async ({ id }: { id: string; apartmentID: string }) =>
      api.delete(`/invoice/${id}`),
    onSuccess: (_data, variables) => {
      invalidateLists(variables.apartmentID);
      toast("Invoice deleted successfully", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during deleting invoice", { type: "error" });
    },
  });

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    const search = filters.search?.trim().toLowerCase();
    if (!search) return invoices;
    return invoices.filter((invoice) =>
      invoice.invoiceID.toLowerCase().includes(search)
    );
  }, [invoices, filters.search]);

  if (isInvoicesLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error?.message} onClick={refetch} />;

  return (
    <RouteContent>
      <main className="flex h-full flex-col gap-6 overflow-y-auto bg-slate-50 p-8 scrollbar-hide">
        <header className="mb-6 flex flex-row items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              {t("invoices.title")}
            </h1>
            <p className="text-sm text-slate-500">
              Zarządzaj swoimi przychodami i monitoruj płatności
            </p>
          </div>
          <Button onClick={() => navigate("/invoices/new")}>
            <Plus />
            {t("invoices.addInvoice")}
          </Button>
        </header>

        <Card className="p-6">
          <InvoicesFilters
            value={filters}
            onChange={setFilters}
            apartments={apartmentsList ?? []}
          />

          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
            {filteredInvoices.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="px-4 text-slate-900">
                      Nr faktury
                    </TableHead>
                    <TableHead className="px-4 text-slate-900">
                      Mieszkanie
                    </TableHead>
                    <TableHead className="px-4 text-slate-900">Typ</TableHead>
                    <TableHead className="px-4 text-slate-900">
                      Kwota
                    </TableHead>
                    <TableHead className="px-4 text-slate-900">
                      Termin
                    </TableHead>
                    <TableHead className="px-4 text-slate-900">
                      Status
                    </TableHead>
                    <TableHead className="px-4 text-right text-slate-900">
                      Akcje
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const apartmentLabel =
                      apartmentLabelById.get(invoice.apartmentID) ??
                      "Unknown apartment";

                    return (
                      <TableRow key={`invoice-row-${invoice._id}`}>
                        <TableCell className="px-4 py-3 font-medium text-slate-900">
                          {invoice.invoiceID}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-slate-500">
                          {apartmentLabel}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-slate-700">
                          {capitalizeFirstLetter(invoice.invoiceType)}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium text-slate-900">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-slate-700">
                          {dayjs(invoice.dueDate).format("DD.MM.YYYY")}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <InvoiceStatusChip invoice={invoice} />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex flex-row items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Szczegóły"
                              title="Szczegóły"
                              onClick={() =>
                                navigate(`/invoice/${invoice._id}`)
                              }
                            >
                              <Eye />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Usuń fakturę"
                              title="Usuń fakturę"
                              disabled={isDeleting}
                              onClick={() =>
                                deleteInvoice({
                                  id: invoice._id,
                                  apartmentID: invoice.apartmentID,
                                })
                              }
                              className="text-rose-600 hover:text-rose-700"
                            >
                              {isDeleting ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <Trash2 />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="bg-white py-10">
                <EmptyView message="No invoices found" />
              </div>
            )}
          </div>
        </Card>
      </main>
    </RouteContent>
  );
};
