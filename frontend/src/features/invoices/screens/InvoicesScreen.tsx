import { useMemo, useState } from "react";
import { Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { RouteContent, ErrorView } from "@components/common";
import api from "@services/api";
import { fetchLandlordApartmentsForSelect } from "@features/apartments/fetchLandlordApartmentsForSelect";
import { getApartmentShortLabel } from "@utils/apartment";

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
import {
  InvoicesFilters,
  InvoiceStatusChip,
  InvoicesScreenSkeleton,
} from "../components";
import { formatInvoiceTenantLabel } from "../utils/invoiceTenantDisplay";
import { getInvoiceTypeLabel } from "../utils/invoiceTypeLabel";

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
    if (filters.invoiceType)
      params.append("invoiceType", filters.invoiceType);
    const value = params.toString();
    return value ? `?${value}` : "";
  }, [filters]);

  const handleGetInvoices = async () => {
    const result = await api.get<InvoiceType[]>(`/invoices${queryParams}`);
    return result.data;
  };

  const {
    data: invoices,
    isPending: isInvoicesPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["invoices", "list", queryParams],
    queryFn: handleGetInvoices,
    placeholderData: (previousData) => previousData,
  });

  const { data: apartmentsList } = useQuery({
    queryKey: ["apartments", "select", "all-owned"],
    queryFn: fetchLandlordApartmentsForSelect,
  });

  const apartmentLabelById = useMemo(() => {
    const map = new Map<string, string>();
    (apartmentsList ?? []).forEach((apartment) => {
      map.set(apartment._id, getApartmentShortLabel(apartment));
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

  const hasActiveListFilters = useMemo(
    () =>
      Boolean(
        filters.apartmentID ||
          filters.invoiceType ||
          filters.isPaid !== "all" ||
          filters.dueDateFrom ||
          filters.dueDateTo
      ),
    [filters]
  );

  const emptyListMessage = useMemo(() => {
    const listLength = invoices?.length ?? 0;
    const hasResults = filteredInvoices.length > 0;
    if (hasResults) return null;
    if (listLength > 0 && filters.search?.trim()) {
      return t("invoices.emptySearch");
    }
    if (listLength === 0 && hasActiveListFilters) {
      return t("invoices.emptyFiltered");
    }
    return t("invoices.empty");
  }, [
    invoices?.length,
    filteredInvoices.length,
    filters.search,
    hasActiveListFilters,
    t,
  ]);

  if (isInvoicesPending && invoices === undefined) {
    return <InvoicesScreenSkeleton />;
  }
  if (isError && invoices === undefined) {
    return <ErrorView message={error?.message} onClick={refetch} />;
  }

  return (
    <RouteContent sectionStyle={{ flexDirection: "column" }}>
      <div className="flex h-full flex-col overflow-hidden bg-slate-50 p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {t("invoices.title")}
            </h1>
            <p className="text-sm text-slate-500">{t("invoices.subtitle")}</p>
          </div>
          <Button
            variant="default"
            onClick={() => navigate("/invoices/new")}
            className="self-start sm:self-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("invoices.addInvoice")}
          </Button>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <InvoicesFilters
              value={filters}
              onChange={setFilters}
              apartments={apartmentsList ?? []}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("invoices.list.columns.invoiceNumber")}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("invoices.list.columns.apartment")}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("invoices.list.columns.tenant")}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("invoices.list.columns.type")}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("invoices.list.columns.amount")}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("invoices.list.columns.dueDate")}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("invoices.list.columns.status")}
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("invoices.list.columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length ? (
                  filteredInvoices.map((invoice) => {
                    const apartmentLabel =
                      apartmentLabelById.get(invoice.apartmentID) ??
                      t("invoices.list.unknownApartment");
                    const tenantLabel =
                      formatInvoiceTenantLabel(invoice) ??
                      t("invoices.list.noTenant");

                    return (
                      <TableRow key={`invoice-row-${invoice._id}`}>
                        <TableCell className="pl-6 py-3 font-medium text-slate-900">
                          {invoice.invoiceID}
                        </TableCell>
                        <TableCell className="py-3 text-slate-500">
                          {apartmentLabel}
                        </TableCell>
                        <TableCell className="py-3 text-slate-600">
                          {tenantLabel}
                        </TableCell>
                        <TableCell className="py-3 text-slate-700">
                          {getInvoiceTypeLabel(t, invoice.invoiceType)}
                        </TableCell>
                        <TableCell className="py-3 font-medium text-slate-900">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell className="py-3 text-slate-700">
                          {dayjs(invoice.dueDate).format("DD.MM.YYYY")}
                        </TableCell>
                        <TableCell className="py-3">
                          <InvoiceStatusChip invoice={invoice} />
                        </TableCell>
                        <TableCell className="pr-6 py-3">
                          <div className="flex flex-row items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t("invoices.list.actions.details")}
                              title={t("invoices.list.actions.details")}
                              onClick={() =>
                                navigate(`/invoice/${invoice._id}`)
                              }
                            >
                              <Eye />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t("invoices.list.actions.delete")}
                              title={t("invoices.list.actions.delete")}
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
                  })
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-sm text-slate-500"
                    >
                      {emptyListMessage}
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
